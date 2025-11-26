"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Hook to monitor a background job's status in real-time.
 *
 * Uses Supabase Realtime to subscribe to UPDATE events on the background_jobs table.
 * Automatically shows toast notifications when the job completes or fails.
 *
 * @param jobId - The UUID of the job to monitor (null if no job to monitor)
 * @returns The current status of the job ('pending' | 'processing' | 'completed' | 'failed')
 */
export function useJobMonitor(jobId: string | null): string {
    const [status, setStatus] = useState<string>("pending");
    const supabase = createClient();

    useEffect(() => {
        if (!jobId) return;

        // Subscribe to real-time updates for this specific job
        const channel = supabase
            .channel(`job-${jobId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "background_jobs",
                    filter: `id=eq.${jobId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status as string;
                    setStatus(newStatus);

                    // Show user feedback
                    if (newStatus === "completed") {
                        toast.success("Processamento concluído!", {
                            description: "Sua prova foi corrigida com sucesso.",
                        });
                    } else if (newStatus === "failed") {
                        toast.error("Erro no processamento", {
                            description: "Ocorreu um erro ao processar sua prova. Tente novamente.",
                        });
                    } else if (newStatus === "processing") {
                        toast.info("Processando...", {
                            description: "A IA está analisando sua prova.",
                        });
                    }
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [jobId, supabase]);

    return status;
}
