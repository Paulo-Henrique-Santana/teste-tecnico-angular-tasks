# Itens de design de arquitetura

Respostas às perguntas de [DESAFIO.md](./DESAFIO.md). Implementação no [README](./README.md).

## 1. Milhões de clientes em diversos países

A tradução é feita no build: cada idioma gera uma versão pronta do site (hoje pt e en-US). Quem
acessa em inglês baixa só o inglês.

O build gera só arquivos estáticos, sem servidor rodando por trás — pronto para publicar numa CDN
(rede de servidores espalhados pelo mundo), que serve o site do ponto mais perto de cada país.
A CDN em si não está configurada neste repositório: é um passo de publicação. Novo idioma =
adicionar o arquivo de tradução.

Já implementado (o build estático; a CDN depende do deploy).

## 2. Estratégia de renderização (celular e conexão ruim)

Escolha: gerar as páginas prontas no build (SSG).

A tela não muda por usuário, então não faz sentido montá-la no celular de cada pessoa. Ela chega
pronta e aparece quase de imediato, em vez de deixar uma tela branca esperando o JavaScript. Cliques
feitos antes do carregamento terminar não se perdem.

Descartado: montar no navegador (tela branca em conexão lenta) e montar no servidor a cada acesso
(mesma página para todos, mas com custo e latência de servidor).

Também ajudam: o carregamento inicial ficou bem mais leve e o script pesado só roda depois que a
tela já está utilizável.

Já implementado.

## 3. Continuar com Angular ou trocar?

Critérios: o quanto o framework já resolve do que o produto precisa, custo de migrar, padronização
em time grande, peso para o usuário e suporte de longo prazo.

Nesses critérios o Angular vai bem: site estático e suporte a vários idiomas já vêm prontos, o
padrão do framework mantém um time grande alinhado, as atualizações são previsíveis e o
carregamento ficou leve depois dos ajustes.

**Decisão: continuar com Angular.** O problema era como a tela era gerada, não o framework — e isso
já foi resolvido.