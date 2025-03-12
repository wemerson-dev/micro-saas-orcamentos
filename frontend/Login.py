import streamlit as st
import streamlit_authenticator as stauth
import requests

st.set_page_config(
    page_title="Meu Orçamento",
    initial_sidebar_state="collapsed",
)


def main():
    with st.form('login'):
        email = st.text_input('Email')
        senha = st.text_input('Password', type='password')
        submit = st.form_submit_button('Entrar')

    if submit:
        if email and senha:
            api_url = 'http://localhost:5000/usuario/login'
            getResponse = requests.post(api_url, json={'email': email, 'senha': senha})
            
            if getResponse.status_code == 200:
                uData = getResponse.json()
                st.write(uData)
                st.success('Login efetuado com sucesso')
                st.session_state['user'] = uData
            else:
                st.error('Usuário ou senha inválidos')
        else:
            st.error('Preencha todos os campos')


if __name__ == '__main__':
    main()
