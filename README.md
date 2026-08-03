# Task List (Angular 21)

Aplicação de lista de tarefas usada como desafio técnico. O enunciado original está em [DESAFIO.md](./DESAFIO.md).

Stack: Angular 21 (standalone, zoneless, SSG, i18n), TypeScript 5.9, signals, Vitest.

## Requisitos

- Node.js 20.19+ (ou 22.12+)
- npm 10+

## Como rodar

```bash
npm install
npm run start:dev      # http://localhost:4200 (pt)
npm run start:dev:en   # http://localhost:4200 (en-US)
npm run start:prod     # produção localizada em pt
npm run build          # SSG por locale em dist/angular-project/browser
npm run extract-i18n   # regenera src/locale/messages.xlf
npm test               # testes unitários
```

Arquivo específico ou com cobertura:

```bash
npx ng test --no-watch --include='**/task-service.spec.ts'
npx ng test --no-watch --coverage
```

## Docker

Build multi-stage (Node 22 → nginx) serve o SSG estático.

```bash
docker compose up --build
# http://localhost:8080      (pt)
# http://localhost:8080/en-US/  (en-US)
```

Ou sem Compose:

```bash
docker build -t angular-tasks .
docker run --rm -p 8080:80 angular-tasks
```

## Estrutura

```
public/                       # arquivos estáticos
└── assets/scripts/legacy-heavy-script.js
src/
├── locale/                   # traduções (pt e en-US)
├── main.ts / main.server.ts
└── app/
    ├── app.ts / app.html
    ├── app.config.ts / app.config.server.ts
    ├── app.routes.ts / app.routes.server.ts
    ├── core/                 # modelos e serviços
    │   ├── models/task.ts
    │   └── services/
    ├── features/tasks/
    │   ├── components/       # form, list, item
    │   └── validators/
    └── shared/components/header/
```

Nomes de arquivo seguem o style guide atual do Angular (sem sufixos `.component`/`.service`).

## Decisões de arquitetura

- **Zoneless + signals**: sem `zone.js`; a tela reage por signals e o carregamento inicial fica menor.
- **Standalone**: sem `NgModule`.
- **SSG**: a página é gerada no build e chega pronta ao usuário — melhor em celular e conexão ruim.
  Cliques feitos antes do JavaScript terminar de carregar não se perdem.
- **Build de produção**: otimização, hashing e budgets ativos.
- **i18n**: textos traduzidos no build. Português em `/`, inglês em `/en-US/`. Novo idioma =
  adicionar o arquivo de tradução e registrá-lo na configuração.

As respostas às perguntas de design de arquitetura estão em [ARQUITETURA.md](./ARQUITETURA.md).

## Funcionamento

### Estado das tasks

`TaskService` guarda a lista em memória. As 3 tasks iniciais já vêm no estado, então aparecem na
abertura sem precisar de interação.

Operações: adicionar, remover, marcar como concluída e checar duplicidade.

Ao adicionar, duas chamadas simuladas de API rodam em paralelo — o tempo total é o da mais lenta
(2s), sem alterar os delays.

### Loading na adição

Enquanto a adição está em andamento, o botão fica desabilitado, o texto vira "Adicionando...",
aparece um spinner e novos submits são ignorados.

### Validação do título

| Regra | Detalhe |
| --- | --- |
| Obrigatório | título não pode ficar vazio |
| Só letras | apenas letras e espaços (aceita acentos) |
| Tamanho mínimo | 20 caracteres |
| Único | não permite título já existente |

A API só é chamada no submit, quando o formulário está válido — nunca a cada digitação.

### Script legado

O script pesado não é necessário na abertura. Ele só carrega depois que a tela já está utilizável,
fora do caminho crítico, para não travar a inicialização.

## Testes

Cada serviço, validador e componente tem seu `.spec.ts` ao lado do arquivo de origem (Vitest +
jsdom).
