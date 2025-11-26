---
trigger: always_on
---

TypeScript Strict Code Style Guidelines
Este documento define os padrões de codificação obrigatórios para este projeto. O objetivo é garantir consistência, legibilidade e, acima de tudo, segurança de tipos (type safety). O não cumprimento destas regras resultará na rejeição do Pull Request.

1. Tipagem e Declaração de Variáveis
   1.1. Anotação Explicita de Tipos (Explicit Typing)
   REGRA: A inferência de tipos é proibida para variáveis inicializadas, parâmetros de função e retornos de função. Toda declaração deve possuir uma anotação de tipo explícita (interface, type alias ou primitivo).

Motivo: Garante que a intenção do desenvolvedor esteja clara e previne mudanças acidentais de tipo durante refatorações.

TypeScript

// ❌ INCORRETO (Inferência)
const userCount = 10;
const userName = "Alice";

function sum(a, b) {
return a + b;
}

// ✅ CORRETO (Explícito)
const userCount: number = 10;
const userName: string = "Alice";

function sum(a: number, b: number): number {
return a + b;
}
1.2. Proibição do any
REGRA: O uso do tipo any é estritamente PROIBIDO.

Se o tipo é desconhecido, use unknown e faça o type narrowing obrigatório antes do uso.

Se o tipo for complexo, crie uma interface ou type adequado.

TypeScript

// ❌ INCORRETO
const data: any = JSON.parse(response);
console.log(data.id); // Perigo: Sem garantia que .id existe

// ✅ CORRETO
interface UserResponse {
id: string;
name: string;
}

const rawData: unknown = JSON.parse(response);

if (isValidUser(rawData)) { // Função Type Guard
const user: UserResponse = rawData;
console.log(user.id);
}
1.3. Imutabilidade (const vs let)
REGRA: Utilize const para todas as declarações. Utilize let apenas se a reatribuição for estritamente necessária e documentada. O uso de var é proibido.

2. Interfaces e Types
   2.1. Interface vs Type
   Use Interface para definir objetos, modelos de dados e contratos de classes. Elas permitem declaration merging e são geralmente mais rápidas para o compilador.

Use Type para uniões (Union Types), interseções complexas, tipos primitivos ou tuplas.

2.2. Nomenclatura de Interfaces
REGRA: Use PascalCase. NÃO utilize prefixos como I (ex: IUser). O nome deve descrever a entidade claramente.

TypeScript

// ❌ INCORRETO
interface IUserData { ... }

// ✅ CORRETO
interface UserProfile { ... }
2.3. Propriedades Opcionais
REGRA: Evite excesso de propriedades opcionais (?). Se um objeto tem muitas opcionais, considere se ele não deveria ser dividido em subtipos ou se deve utilizar um Utility Type como Partial<T> em contextos específicos.

3. Funções e Métodos
   3.1. Retornos Explícitos
   REGRA: Todas as funções devem declarar explicitamente o tipo de retorno, mesmo que seja void.

TypeScript

// ❌ INCORRETO
const logMessage = (msg: string) => console.log(msg);

// ✅ CORRETO
const logMessage = (msg: string): void => {
console.log(msg);
};
3.2. Argumentos de Função
REGRA: Funções não devem exceder 3 argumentos posicionais. Se precisar de mais, utilize um objeto de configuração (Rove/Destructuring Pattern) com uma interface definida.

TypeScript

// ❌ INCORRETO
function createUser(name: string, email: string, age: number, isAdmin: boolean): User { ... }

// ✅ CORRETO
interface CreateUserParams {
name: string;
email: string;
age: number;
isAdmin: boolean;
}

function createUser(params: CreateUserParams): User { ... } 4. Assincronismo
4.1. Async/Await
REGRA: Prefira sempre async/await ao invés de encadeamento de .then(). e .catch(). REGRA: Todo await que envolva chamadas externas (API, DB) deve estar envolvido em um bloco try/catch.

TypeScript

// ❌ INCORRETO
function getData(): void {
api.get('/users')
.then(res => console.log(res))
.catch(err => console.error(err));
}

// ✅ CORRETO
async function getData(): Promise<void> {
try {
const response: ApiResponse = await api.get('/users');
console.log(response);
} catch (error: unknown) {
handleError(error);
}
} 5. Convenções de Nomenclatura (Naming)
Variáveis e Funções: camelCase (ex: getUser, isValid).

Classes e Componentes: PascalCase (ex: UserController, MainButton).

Constantes Globais/Hardcoded: UPPER_SNAKE_CASE (ex: MAX_RETRY_ATTEMPTS).

Booleanos: Devem responder a uma pergunta sim/não. Prefixe com is, has, should, can (ex: isEnabled, hasAccess). Evite negações no nome (ex: evite isNotActive, prefira isActive).

6. Estrutura e Organização
   6.1. Importações
   REGRA: As importações devem ser ordenadas. Primeiro bibliotecas externas, depois módulos internos absolutos, e por fim módulos relativos. Não deixe importações não utilizadas.

6.2. Exportações
REGRA: Prefira Named Exports ao invés de Default Exports. Isso facilita o refactoring e a intellisense da IDE, além de garantir que o nome da importação corresponda ao nome da definição.

TypeScript

// ❌ INCORRETO (Default)
export default class User { ... }

// ✅ CORRETO (Named)
export class User { ... } 7. Tratamento de Nulos e Indefinidos
7.1. Optional Chaining e Nullish Coalescing
REGRA: Use Optional Chaining (?.) para acessar propriedades profundas e Nullish Coalescing (??) para valores padrão. Evite o operador lógico || para fallbacks numéricos ou booleanos para evitar bugs com 0 ou false.

TypeScript

// ❌ INCORRETO
const timeout = config.timeout || 1000; // Bug se timeout for 0

// ✅ CORRETO
const timeout: number = config.timeout ?? 1000;
