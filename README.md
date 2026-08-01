# A última pessoa que desenvolveu esse projeto deixou alguns itens que precisam ser corrigidos/implementados:
- Deveria ser listadas 3 tasks já pré-preenchidas. Mas elas só surgem quando o cliente preenche algo e clica em adicionar task. Essas 3 tasks devem ser pré-carregadas na inicialização.
- Existe um erro que estoura no console quando o app é inicializado, e portanto deve ser solucionado.
- Não deveria chamar api a cada digitação do cliente na adição de novas tasks
- Existe um problema de performance na chamada de API, portanto diminua o tempo de exibição de adição de cada task, no entanto os delays ou seus valores não podem ser removidos ou alterados
- Não permitir adicionar a mesma task, devendo aceitar somente letras com no mínimo 20 caracteres;
- Crie os testes unitários;
- As pastas estão desorganizadas, é preciso organizar;
- Há um problema de perfomance num script inicial que trava a inicialização inicial, mas não é obrigatório no momento de inicialização, podendo ser carregado posteriormente.
- Documente o projeto

# Itens de design de arquitetura:
- Esse front é utilizado por milhões de clientes em diversos países.
- O front não exige dinamismo na interface em runtime; Além disso, esse front também é muito acesso por dispositivos móveis. Qual tipo de estratégia de renderização você utilizaria para melhorar a performance, principalmente para cliente com baixa conexão?
- A empresa está avaliando se continua utilizando o angular ou muda pra uma nova tecnologia e te pediu uma avaliação. Você precisa avaliar de acordo com os critérios que você mesmo definir e deverá apresentar sua escolha final.

# Opcional
- A área de qualidade percebeu que nenhum loading está sendo apresentado na adição de novos itens, dando a impressão da tela estar travada;
- Utilizar os recursos mais recentes da linguagem e framework;

## Com exceção dos itens que você não pode remover dentro do código, utilize as melhores práticas de desenvolvimento.


