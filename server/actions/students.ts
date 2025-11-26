"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const CreateStudentSchema = z.object({
    name: z
        .string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(100, "Nome deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    grade: z.string().min(1, "Série é obrigatória").max(50, "Série inválida"),
});

// =====================================================
// TYPES
// =====================================================

interface CreateStudentResult {
    success: boolean;
    studentId?: string;
    error?: string;
}

interface GetStudentsResult {
    success: boolean;
    students?: Array<{
        id: string;
        name: string;
        grade_level: string;
        created_at: string;
    }>;
    error?: string;
}

// =====================================================
// ACTIONS
// =====================================================

/**
 * Create a new student with encrypted name.
 *
 * SECURITY: This action calls the RPC `create_secure_student` which:
 * 1. Encrypts the student name using pgp_sym_encrypt
 * 2. Stores only the encrypted bytea in the database
 * 3. Ensures the user belongs to an institution
 *
 * The encryption key is stored in the database settings, NOT in the client.
 */
export async function createStudentAction(data: { name: string; grade: string }): Promise<CreateStudentResult> {
    try {
        // 1. Validate input
        const validation = CreateStudentSchema.safeParse(data);

        if (!validation.success) {
            return {
                success: false,
                error: validation.error.errors[0]?.message || "Dados inválidos",
            };
        }

        // 2. Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Usuário não autenticado" };
        }

        // 3. Call the secure RPC function
        // This function handles encryption server-side
        const { data: studentId, error: rpcError } = await supabase.rpc("create_secure_student", {
            name_text: validation.data.name,
            grade: validation.data.grade,
        });

        if (rpcError) {
            console.error("[Create Student] RPC error:", rpcError);

            // Handle specific errors
            if (rpcError.message.includes("institution")) {
                return {
                    success: false,
                    error: "Usuário não possui instituição associada",
                };
            }

            if (rpcError.message.includes("encryption_key")) {
                return {
                    success: false,
                    error: "Erro de configuração do sistema. Contate o administrador.",
                };
            }

            return { success: false, error: "Erro ao criar aluno" };
        }

        // 4. Revalidate the students page
        revalidatePath("/dashboard/students");

        return {
            success: true,
            studentId: studentId as string,
        };
    } catch (error) {
        console.error("[Create Student] Unexpected error:", error);
        return {
            success: false,
            error: "Erro inesperado ao criar aluno",
        };
    }
}

/**
 * Get all students for the current user's institution (with decrypted names).
 *
 * SECURITY: This action calls the RPC `get_students_decrypted` which:
 * 1. Verifies the user belongs to the requested institution
 * 2. Decrypts student names server-side using pgp_sym_decrypt
 * 3. Returns only students from the user's institution
 */
export async function getStudentsAction(): Promise<GetStudentsResult> {
    try {
        // 1. Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Usuário não autenticado" };
        }

        // 2. Get user's institution ID
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("institution_id")
            .eq("id", user.id)
            .single();

        if (profileError || !profile?.institution_id) {
            console.error("[Get Students] Profile error:", profileError);
            return {
                success: false,
                error: "Usuário não possui instituição associada",
            };
        }

        // 3. Call the secure RPC function to get decrypted students
        const { data: students, error: rpcError } = await supabase.rpc("get_students_decrypted", {
            p_institution_id: profile.institution_id,
        });

        if (rpcError) {
            console.error("[Get Students] RPC error:", rpcError);

            if (rpcError.message.includes("Access denied")) {
                return {
                    success: false,
                    error: "Acesso negado",
                };
            }

            if (rpcError.message.includes("encryption_key")) {
                return {
                    success: false,
                    error: "Erro de configuração do sistema. Contate o administrador.",
                };
            }

            return { success: false, error: "Erro ao buscar alunos" };
        }

        return {
            success: true,
            students: students || [],
        };
    } catch (error) {
        console.error("[Get Students] Unexpected error:", error);
        return {
            success: false,
            error: "Erro inesperado ao buscar alunos",
        };
    }
}
