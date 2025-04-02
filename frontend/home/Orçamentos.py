
import streamlit as st
import requests

st.set_page_config(
    page_title='Tela de Orçamento', 
    page_icon=':money_with_wings:', 
    layout='wide')

API_URL = 'http://localhost:5000/Cliente/listar'
responseGet = requests.get(API_URL)


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


def telaOrcamento():
    st.title('Tela de Orçamento')
    st.write('Aqui você pode criar um orçamento para o cliente selecionado.')
    
    # Formulário para criar um novo orçamento
    with st.form(key='orcamento_form'): 
        if len(filtredClient) > 0:
            for slcCli in filtredClient:
                cIdCli = slcCli['id']
                nome_cliente = st.text_input('Nome do Cliente',value=slcCli['nome'], disabled=False)
                st.title('Itens do Orçamento')
                descricao = st.text_area('Descrição do Orçamento')
                valor = st.number_input('Valor do Orçamento', min_value=0.0, format="%.2f")
                data_validade = st.date_input('Data de Validade')

        submit_button = st.form_submit_button(label='Criar Orçamento')
        
        if submit_button:
            # Aqui você pode adicionar a lógica para enviar os dados do orçamento para a API
            apiUrl = "http://localhost:5000/orcamento/criar"
            response = requests.post(apiUrl, json={
                'nome_cliente': nome_cliente,
                'descricao': descricao,
                'valor': valor,
                'data_validade': str(data_validade)
            })
            
            if response.status_code == 201:
                st.success('Orçamento criado com sucesso!')
            else:
                st.error('Erro ao criar o orçamento. Tente novamente.')

if __name__ == '__main__':
    # Chama a função para exibir a tela de orçamento
    telaOrcamento()