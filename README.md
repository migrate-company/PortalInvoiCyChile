# Portal InvoiCy Uruguay

Portal de documentação técnica de integração com o InvoiCy Uruguay utilizando o framework MKDOCS.

Como atualizar os artigos

- Clone o repositório na sua máquina.
- instale o Python +3.10.
- Instale o Poetry via terminal

    ```shell
    pip install poetry
    ```

- Rode o comando abaixo para carregar as dependências, como MKDOCS.

    ```shell
    poetry install
    ```

- Pode ser que dê erro no mkdocs.yml, na linha "format: !!python/name:pymdownx.superfences.fence_code_format".
    Neste caso as dependências não foram devidamente instaladas com o Poetry.
    Um contorno é instalar via PIP:

    ```shell
    pip install requirements.txt
    ```

- Todos os artigos devem ser cridos em arquivos .md dentro do diretório "docs".
- Itens no menu devem ser incluídos no mkdocs.yml.

Como testar aplicação local

- rode no terminal o comando abaixo:

    ```shell
    mkdocs serve
    ```

- Vai ser disponibilizado localmente um serviço em http://127.0.0.1:8000/PortalInvoiCyUruguay/
- Será criado um diretório "site" com os arquivos estáticos. Este diretório está para ser ignorado no .gitignore, pois não é necessário depois.
- Por vezes, o mkdocs serve não copia novos arquivos para o diretório site, então é necessário rodar o comando abaixo para forçar a recriação.

    ```shell
    mkdocs build
    ```

Como subir para produção

- Comite todas as alterações e atualize o repositório remoto, pois essa é a versão original para qualquer pessoa alterar.

    ```shell
    git add <arquivos>
    git commit -m "descrição do commit"
    git push
    ```

- Existe uma action CI/CD configurada para atualizar automaticamente quando um commit é subido para a branch master.
- Em instantes estará atualizado em https://migrate-company.github.io/PortalInvoiCyUruguay/
- Caso ocorra algum problema no CI/CD, pode ser necessário executar manualmente.
  - Execute o comando através da branch master para gerar uma branch "gh-pages":

    ```shell
    mkdocs gh-deploy
    ```

  - Automaticamente o mkdocs irá subir essa branch "gh-pages" para o repositório do github e habilitar a página.
  - Em instantes estará atualizado em https://migrate-company.github.io/PortalInvoiCyUruguay/
