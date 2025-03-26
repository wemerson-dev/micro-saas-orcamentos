import streamlit as st
import streamlit_authenticator as stauth
import requests
from time import sleep
from Clientes import formNewClient, deleteClient, telaCli

def login():
    with st.container(border=True):
        st.markdown('Bem vindo seu App de Orçamentos')
        userMail = st.text_input('insira seu email')
        userPass = st.text_input('insira sua senha', type='password')
        if st.button('Logar'):
            if userMail and userPass:
                apiUrl = "http://localhost:5000/usuario/login"
                getresponse = requests.post(apiUrl, json={'email': userMail, 'senha': userPass})

                if getresponse.status_code == 200:
                    st.success('Login efetuado com sucesso')
                    st.session_state['user'] = userMail
                    st.session_state['logado'] = True
                    sleep(1)
                    st.experimental_user()
                else:
                    st.error('Login ou senha incorretos')



def main():
    if not 'logado' in st.session_state:
        st.session_state['logado'] = False

    if not st.session_state['logado']:
        login()
    else:
        telaCli()

if __name__ == '__main__':
    main()
