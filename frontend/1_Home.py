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
    
slcClient = st.sidebar.selectbox('Selecione o Cliente', listCli)
filtredClient = [cli for cli in clients if cli['nome'] == slcClient]


    