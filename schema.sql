--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cliente" (
    id text NOT NULL,
    nome text NOT NULL,
    endereco text NOT NULL,
    bairro text NOT NULL,
    numero integer NOT NULL,
    cidade text NOT NULL,
    email text NOT NULL,
    telefone text,
    cgc text NOT NULL,
    "usuarioId" text NOT NULL
);


ALTER TABLE public."Cliente" OWNER TO postgres;

--
-- Name: ItemOrcamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ItemOrcamento" (
    id text NOT NULL,
    quantidade integer NOT NULL,
    descricao text NOT NULL,
    "precoUnitario" double precision NOT NULL,
    "orcamentoId" text NOT NULL
);


ALTER TABLE public."ItemOrcamento" OWNER TO postgres;

--
-- Name: Orcamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Orcamento" (
    id text NOT NULL,
    "numOrc" integer NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    "dataEmissao" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "clienteId" text NOT NULL
);


ALTER TABLE public."Orcamento" OWNER TO postgres;

--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Usuario" (
    id text NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    "logoPath" text
);


ALTER TABLE public."Usuario" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Cliente Cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY (id);


--
-- Name: ItemOrcamento ItemOrcamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemOrcamento"
    ADD CONSTRAINT "ItemOrcamento_pkey" PRIMARY KEY (id);


--
-- Name: Orcamento Orcamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orcamento"
    ADD CONSTRAINT "Orcamento_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Cliente_cgc_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cliente_cgc_key" ON public."Cliente" USING btree (cgc);


--
-- Name: Cliente_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cliente_email_key" ON public."Cliente" USING btree (email);


--
-- Name: Orcamento_numOrc_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Orcamento_numOrc_key" ON public."Orcamento" USING btree ("numOrc");


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: Cliente Cliente_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ItemOrcamento ItemOrcamento_orcamentoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemOrcamento"
    ADD CONSTRAINT "ItemOrcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES public."Orcamento"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orcamento Orcamento_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orcamento"
    ADD CONSTRAINT "Orcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

