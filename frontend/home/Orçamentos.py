
import streamlit as st
import requests
from datetime import datetime
import time

st.set_page_config(
    page_title='Tela de Orçamento', 
    page_icon=':money_with_wings:', 
    layout='wide')

# Endpoint Lista clientes  
API_URL = 'http://localhost:5000/Cliente/listar'
responseGet = requests.get(API_URL)

# Logica para adionar itens   
if "itens"  not in st.session_state:
    st.session_state.itens = []

def add_item():
    st.session_state.itens.append({"quantidade": 1, "descricao": "", "precoUnitario": 0.0})
    #Laço de repetição para adionar novos itens.
    for i, item in enumerate(st.session_state.itens):
        #st.markdown(f"**Item {i + 1}**")
        cols = st.columns(3)
        with cols[0]:
            st.session_state.itens[i]['quantidade'] = st.number_input(
                'Quantidade', value=item['quantidade'], min_value=1, step=1, key=f'quantidade_{i}')
        with cols[1]:
            st.session_state.itens[i]['descricao'] = st.text_input(
                'Descrição', value=item['descricao'], key=f'descricao_{i}')
        with cols[2]:
            st.session_state.itens[i]['precoUnitario'] = st.number_input(
                'Preço Unitário', value=item['precoUnitario'], min_value=0.0, step=0.01, key=f'precoUnitario_{i}')

# Get para cerregar Clientes 
if responseGet.status_code == 201:
    clients = responseGet.json()
else:
    st.error('Erro ao carregar a lista de clientes')
    clients = []   # Lista de clientes

listCli = []
for cli in clients:
    listCli.append(cli['nome'])
    
# Seleção do cliente   
slcClient = st.sidebar.selectbox('Selecione o Cliente', listCli)
filtredClient = [cli for cli in clients if cli['nome'] == slcClient]

# Construtor tela de Orçamentos 
def telaOrcamento():
    st.title('Tela de Orçamento')
    st.write('Aqui você pode criar um orçamento para o cliente selecionado.')
    
    # Formulário para criar um novo orçamento
    with st.form(key='orcamento_form'): 
        if len(filtredClient) > 0:
            for slcCli in filtredClient:
                cIdCli = slcCli['id']
                nome_cliente = st.text_input('Nome do Cliente',value=slcCli['nome'], disabled=False)
                colleft, colright = st.columns(2)
                with colleft:
                    emailC = st.text_input('Email do Cliente', value=slcCli['email'], disabled=False)
                with colright:
                    foneC = st.text_input('Telefone do Cliente', value=slcCli['telefone'], disabled=False)
                
                st.subheader('Itens do Orçamento')
                
        if st.form_submit_button('Adicionar Item'): # Botão adionar novo item 
            add_item()

                
        submit_button = st.form_submit_button(label='Criar Orçamento')
        
        if submit_button:
            # Formato ISO 8601 com Zulu time (UTC)
            dateNow = datetime.now().isoformat() + "Z"  

            # Aqui você pode adicionar a lógica para enviar os dados do orçamento para a API
            apiUrl = "http://localhost:5000/orcamento/criar"
            response = requests.post(apiUrl, json={
                'clienteId': cIdCli,
                'numOrc': 5,
                'dataEmissao': dateNow,
                'itens': st.session_state.itens,   
            })
            
            if response.status_code == 201:
                st.success('Orçamento criado com sucesso!')
                if "itens" in st.session_state:
                    st.session_state.itens = []
                 # Espera 2 segundos antes de atualizar a página
                time.sleep(2) 
                # Atualiza a página para mostrar o orçamento criado
                st.rerun()  
            else:
                st.error('Erro ao criar o orçamento. Tente novamente.')
                if "itens" in st.session_state:
                    st.session_state.itens = [] 
                time.sleep(2)
                st.rerun()

         



if __name__ == '__main__':
    # Chama a função para exibir a tela de orçamento
    telaOrcamento()