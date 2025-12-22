# MASTER PRD: SISTEMA OPERACIONAL COGNITIVO PEDAGOGI.AI

**De:** MVP (A Ferramenta) $\to$ **Para:** UNICÓRNIO (O Ecossistema)
**Versão:** 2.0 (Full Roadmap) | **Autor:** O Arquiteto de Produtos Digitais

---

## 1. A VISÃO DO UNICÓRNIO (THE END GAME)

> **"Não estamos construindo um app de correção de provas. Estamos construindo a infraestrutura digital que sustentará a educação básica global."**

A **Pedagogi.ai** atingirá o status de unicórnio não pela venda de software, mas por se tornar o **Sistema Operacional** invisível da sala de aula. Ao dominar o fluxo de "Planejar-Criar-Corrigir", acumularemos o maior dataset de aprendizado granular do mundo (erros específicos por questão, por região, por demografia), criando barreiras de entrada intransponíveis (**Data Moats**) e um **Marketplace** onde o conteúdo flui e monetiza.

---

## 2. FUNDAMENTOS ESTRATÉGICOS (O PORQUÊ E O QUEM)

### 2.1 O Problema Raiz (The Struggle)

- **Fato Brutal:** Professores gastam 50% do tempo em tarefas administrativas não remuneradas.
- **A Ineficiência:** O ciclo de avaliação atual é analógico, fragmentado e lento. O professor é um "data entry clerk" glorificado.
- **A Oportunidade:** IAs generalistas (ChatGPT) ajudam no texto, mas falham na "última milha" (formatação de prova, leitura de manuscrito, alinhamento BNCC).

### 2.2 Proposta de Valor e Defensibilidade

- **Para o Professor:** "Devolvemos seus fins de semana." (Produtividade 10x).
- **Para a Escola:** Padronização e dados em tempo real sobre o aprendizado.
- **O Fosso (Moat):**
  1.  **Verticalização:** UX específica para fluxos escolares (ex: OCR de letra de mão) que o ChatGPT não prioriza.
  2.  **Efeitos de Rede:** Quanto mais professores usam, melhor o banco de questões e mais precisa a correção.

### 2.3 Métrica North Star (NSM)

- **Métrica:** **Avaliações Corrigidas com Sucesso**.
- **Por quê?** É a única métrica que prova que o professor completou o ciclo de valor (criou, aplicou, corrigiu) e economizou tempo real.

---

## 3. FASE 1: O MVP (PRODUCT-MARKET FIT)

**Foco Tático:** Validar a utilidade técnica e "estancar o sangramento" de tempo do professor.
**Horizonte:** Meses 0-6.

### 3.1 Funcionalidades Core (Backlog Prioritário)

#### **Aposta A: Motor "Foto-para-Nota" (Vision Tech)**

- **Job Story:** "Como professor com 200 provas, quero tirar uma foto do gabarito e da folha de resposta para ter a nota instantaneamente."
- **Requisitos:**
  - **Scanner Inteligente:** Detecção de bordas e correção de perspectiva.
  - **OCR Híbrido:** Leitura de gabaritos (bolinhas) e respostas curtas manuscritas (ex: "Napoleão").
  - **Human-in-the-loop:** Interface "Tinder" para o professor validar a nota sugerida pela IA (Gera confiança).

#### **Aposta B: Gerador de Provas "Click-to-Print"**

- **Job Story:** "Como professor, quero gerar um PDF pronto para impressão com cabeçalho da escola a partir de um tópico, sem ter que formatar no Word."
- **Requisitos:**
  - **Seletor BNCC:** Input estruturado (Ano, Disciplina, Habilidade).
  - **Layout Automático:** Geração de PDF vetorial diagramado.
  - **Viralidade:** Marca d'água "Feito com Pedagogi.ai" no rodapé (Growth Loop).

### 3.2 Critérios de Sucesso do MVP

- [ ] **Retenção:** 40% dos usuários voltarem na semana seguinte.
- [ ] **NPS:** > 50 (Promotores apaixonados).
- [ ] **Performance:** OCR processando em < 4 segundos.

---

## 4. FASE 2: ESCALA E RETENÇÃO (GROWTH)

**Foco Tático:** Transformar a ferramenta utilitária em um hábito diário e sistema de registro.
**Horizonte:** Meses 6-18.

### 4.1 Expansão do Produto

- **O "Diário de Classe" Digital:** Importação de listas de alunos. As notas não ficam soltas; elas vão para o perfil do aluno, gerando histórico.
- **Análise de Turma (Analytics):** "Professora, 60% da turma errou frações. Aqui está uma lista de exercícios de reforço gerada automaticamente."
- **Modelo Enterprise (B2B):** Venda para escolas/redes. Painel do diretor para ver performance global.

### 4.2 Estratégia de Growth (PLG)

- **Loop Viral:** Professores compartilham provas (PDFs) com colegas. O colega escaneia o QR Code na prova e vira usuário.
- **Freemium Agressivo:** Grátis para uso individual; Pago para recursos de "Turma" e "Histórico ilimitado".

---

## 5. FASE 3: O UNICÓRNIO (ECOSYSTEM & MARKETPLACE)

**Foco Tático:** Monetização transacional e domínio do mercado.
**Horizonte:** +18 Meses.

### 5.1 O Marketplace de Conteúdo (Teachers Pay Teachers 2.0)

- **Conceito:** Professores "Estrelas" criam provas incríveis e as vendem ou licenciam na plataforma.
- **Diferencial:** O conteúdo já vem formatado e integrado ao sistema de correção. Com um clique, o comprador aplica e corrige.
- **Revenue Share:** A Pedagogi.ai fica com uma taxa (take rate) sobre as transações.

### 5.2 A IA Preditiva (O Oráculo Pedagógico)

- **Visão:** Com milhões de dados de correção, a IA começa a prever dificuldades de aprendizado _antes_ da prova final.
- **Intervenção:** Sugestão automática de conteúdo personalizado para o aluno (B2C direto para pais/alunos).

---

## 6. ARQUITETURA E REQUISITOS NÃO-FUNCIONAIS

### 6.1 Princípios de Engenharia

- **Mobile-First & Offline-First:** A escola tem internet ruim. O app deve permitir tirar fotos offline e sincronizar depois.
- **Privacidade por Design (LGPD/GDPR):** Dados de menores são tóxicos se mal geridos. Criptografia em repouso e anonimização de dados para treinamento de IA.

### 6.2 Stack Tecnológica Sugerida

- **Frontend:** React Native ou Flutter (Código único para iOS/Android).
- **Backend:** Python (FastAPI) para orquestração de IA.
- **IA/ML:**
  - OCR: Tesseract (básico) -> Fine-tuned Vision Transformers (avançado).
  - LLM: Integração via API (OpenAI/Anthropic) com RAG vetorizado (Pinecone) para base BNCC.

---

## 7. NEXT STEPS (PLANO DE AÇÃO IMEDIATA)

1.  **Semana 1-2:** Prototipação do fluxo de "Foto-para-Nota" (Figma).
2.  **Semana 3-4:** POC Técnica do OCR (Validar se conseguimos ler letra de mão com acurácia > 80%).
3.  **Semana 5-6:** Desenvolvimento do MVP Alpha para 50 "Professores Parceiros".

> **Comando Final:** Equipe, o alvo não é o software, é o tempo livre do professor. Cada segundo que removemos de latência no OCR é um segundo a mais de vida para nosso usuário. Construam com empatia.
