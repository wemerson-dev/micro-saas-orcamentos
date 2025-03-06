import streamlit as st
import requests

API_URL = 'http://localhost:5000/Cliente/listar'
responseGet = requests.get(API_URL)

# Configuração da página
st.set_page_config(
    page_title="Meu Orçamento",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Título
st.sidebar.title('Menu')


# Verifica se a requisição foi bem sucedida
if responseGet.status_code == 201:
    clients = responseGet.json()
else:
    st.error('Erro ao carregar a lista de clientes')
    clients = []

# Lista de clientes
listCli = []
for cli in clients:
    listCli.append(cli['nome'])
    
# Seleção do cliente   
slcClient = st.sidebar.selectbox('Selecione o Cliente', listCli)
filtredClient = [cli for cli in clients if cli['nome'] == slcClient]

# Exibição dos dados do cliente
if len(filtredClient) > 0:
    for slcCli in filtredClient:
        with st.form(key=f'form_{slcCli["id"]}'):
            st.text_input("Nome", value=slcCli['nome'], disabled=True)
            st.text_input("CNPJ/CPF", value=slcCli['cgc'], disabled=True)
            st.text_input("Telefone", value=slcCli['telefone'], disabled=True)
            st.text_input("Email", value=slcCli['email'], disabled=True)
            st.text_input("Endereço", value=slcCli['endereco'], disabled=True)
            col1, col2, col3= st.columns(3)
            with col1:
                st.form_submit_button('Criar Orçamento')
            with col2:
                st.form_submit_button('Adicionar Novo Cliente')
            with col3:
                st.form_submit_button('Excluir Cliente')
else:
    st.error('Cliente não encontrado')

    