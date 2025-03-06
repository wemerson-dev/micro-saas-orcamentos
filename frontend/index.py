import streamlit as st
import requests

API_URL = 'http://localhost:5000/Cliente/listar'

st.title('Listar Clientes')

responseGet = requests.get(API_URL)

if responseGet.status_code == 200:
    client = responseGet.json()
else:
    st.error('Erro ao carregar a lista de clientes')
    