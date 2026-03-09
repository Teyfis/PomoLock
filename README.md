<div align="center">

# 🍅 PomoLock

**Um timer Pomodoro moderno com modo hyperfocus, estatísticas visuais e sincronização na nuvem.**

🌐 **[Acessar o PomoLock](https://pomolock.vercel.app)**

*[🇺🇸 English version](./README.en.md)*

</div>

---

## 💡 Motivação

Eu queria um aplicativo Pomodoro simples, mas que tivesse algo que a maioria não tem: **estatísticas visuais no estilo habit tracker**, inspiradas no app [YeolPumTa (열품타)](https://play.google.com/store/apps/details?id=com.paidtogo.yeolpumta), um aplicativo coreano de estudos. A ideia era poder visualizar meu progresso diário em um **heatmap** — parecido com o gráfico de contribuições do GitHub — para me motivar a manter a consistência nos estudos.

Outro ponto essencial era a **sincronização entre dispositivos**: eu queria acessar minhas estatísticas tanto no meu computador pessoal quanto no computador da faculdade, sem perder nenhum dado. Por isso, o PomoLock conta com login via Google e armazenamento na nuvem, garantindo que tudo esteja sempre atualizado independente de onde eu acesse.

Como não encontrei nada que atendesse exatamente o que eu queria, resolvi construir o meu próprio, utilizando **inteligência artificial como assistente de desenvolvimento** para acelerar o processo.

## ✨ Funcionalidades

- ⏱️ **Timer Pomodoro** — Focus, Short Break e Long Break configuráveis
- 🧠 **Modo Hyperfocus** — Continue além do timer sem limites
- 📊 **Heatmap de estatísticas** — Visualize sua produtividade no estilo GitHub/YeolPumTa
- 🔐 **Login com Google** — Autenticação via OAuth (opcional)
- ☁️ **Sincronização na nuvem** — Seus dados acompanham você em qualquer dispositivo
- 📱 **PWA** — Instalável no celular e desktop, funciona offline
- 🎨 **Cores personalizáveis** — Customize as cores de cada modo
- 🔊 **Alarmes configuráveis** — Escolha o som e volume do alarme
- 🌙 **Interface dark** — Design moderno e minimalista

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Estilização | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Estado | [Zustand](https://zustand.docs.pmnd.rs/) (com persistência em localStorage) |
| Auth & Database | [Supabase](https://supabase.com/) (Google OAuth + PostgreSQL) |
| Deploy | [Vercel](https://vercel.com/) |
| Ícones | [Lucide React](https://lucide.dev/) |

## 🤖 Construído com auxílio de IA

Este projeto foi **desenvolvido com assistência de inteligência artificial** como ferramenta de pair programming. A IA ajudou na arquitetura, implementação de funcionalidades, debugging e boas práticas — acelerando significativamente o desenvolvimento sem comprometer a qualidade do código.

## 📦 Rodando localmente

```bash
# Clonar o repositório
git clone https://github.com/Teyfis/PomoLock.git
cd PomoLock

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Preencha com suas credenciais do Supabase

# Rodar
pnpm dev
```

## 📄 Licença

Este projeto é de uso pessoal e educacional. Sinta-se à vontade para se inspirar!

---

<div align="center">

Desenvolvido por **Tiago Luterbach** — Estudante de Ciência da Computação na UFF

</div>
