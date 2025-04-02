import streamlit as st
import requests
import time

API_URL = 'http://localhost:5000/Cliente/listar'
responseGet = requests.get(API_URL)


# função para criar novo cliente
@st.dialog('Cadastro de Clientes')
def formNewClient():
    st.subheader('Preencha os campos abaixo ')
    userId = 'f88971c4-4ad1-40bf-8466-51d0785be206'     
    with st.form(key='form_newClient'):
        nome = st.text_input("Nome")
        cgc = st.text_input("CNPJ/CPF")
        telefone = st.text_input("Telefone")
        email = st.text_input("Email")
        endereco = st.text_input("Endereço")
        numero = st.text_input("Número")
        bairro = st.text_input("Bairro")
        cidade = st.text_input("Cidade")
        if st.form_submit_button('Salvar'):
            newClient = {
                'nome': nome,
                'cgc': cgc,
                'telefone': telefone,
                'email': email,
                'endereco': endereco,
                'numero': numero,
                'bairro': bairro,
                'cidade': cidade,
                'usuarioId': userId
            }
            response = requests.post('http://localhost:5000/cliente/criar', json=newClient)
            if response.status_code == 201:
                st.success('Cliente cadastrado com sucesso')
                time.sleep(2)
                st.rerun()
            else:
                st.error('Erro ao cadastrar cliente')
                time.sleep(2)   
                st.rerun()

# Função para excluir Cliente
@st.dialog('Confirma a exclusão do cliente?')
def deleteClient(id):
    butonS = st.button('Sim')
    butonN = st.button('Não')
    if butonS:
        API_URL = 'http://localhost:5000/cliente/deletar/' + str(id)
        response = requests.delete(API_URL)
        if response.status_code == 200:
            st.success('Cliente excluído com sucesso')
            time.sleep(2)
            st.rerun()
        else:
            st.error('Ação não permitida para este cliente')
            time.sleep(2)
            st.rerun()
    if butonN:
        st.rerun()

# Título
#st.sidebar.title('Menu')

def telaCli():
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
    st.write('Cliente selecionado:', slcClient)
    filtredClient = [cli for cli in clients if cli['nome'] == slcClient]

    # Exibição dos dados do cliente
    with st.container(border=True):
        st.subheader('Dados do Cliente')
        if len(filtredClient) > 0:
            for slcCli in filtredClient:
                cIdCli = slcCli['id']
                with st.form(key=f'form_{cIdCli}'):
                    st.text_input("Nome", value=slcCli['nome'], disabled=True)
                    st.text_input("CNPJ/CPF", value=slcCli['cgc'], disabled=True)
                    st.text_input("Telefone", value=slcCli['telefone'], disabled=True)
                    st.text_input("Email", value=slcCli['email'], disabled=True)
                    st.text_input("Endereço", value=slcCli['endereco'], disabled=True)    
                    col1, col2, col3= st.columns(3, vertical_alignment='bottom')  
                    with col1:
                        st.form_submit_button('Criar Orçamento')
                    with col2:
                        if st.form_submit_button('Novo Cliente'):
                            formNewClient()                        
                    with col3:
                        if st.form_submit_button('Excluir Cliente'):
                            deleteClient(cIdCli)
        else:
            st.error('Cliente não encontrado')  

if __name__ == '__main__':
    telaCli()

