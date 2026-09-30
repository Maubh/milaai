import Link from "next/link";

import {
  ATUALIZADO_EM,
  BASES_LEGAIS,
  CONECTORES_DISPONIVEIS,
  CONECTORES_VALIDACAO_PENDENTE,
  CONTATO_PRIVACIDADE,
  CONTROLADOR_CNPJ,
  CONTROLADOR_NOME,
  DADOS_TRATADOS,
  DECISAO_AUTOMATIZADA_RESSALVA,
  DECISAO_AUTOMATIZADA_TEXTO,
  DIREITOS,
  EXPURGO_AUTOMATICO_ATIVO,
  FUNCOES,
  GOOGLE_ESCOPOS,
  GOOGLE_LIMITED_USE,
  GOOGLE_O_QUE_ACESSA,
  INSTAGRAM,
  ISOLAMENTO,
  NAO_FEITO,
  NAO_PRONTOs_FRASE,
  RETENCAO,
  RETENCAO_NOTA,
  SUBCONTROLADORES,
  TITULARES,
  TRANSFERENCIA_INTERNACIONAL,
} from "@/lib/legal";

export const metadata = {
  title: "Política de privacidade — mila.",
  description:
    "Como a mila. trata dados: WhatsApp, site, login, IA, Google e transferência internacional.",
};

export default function PrivacidadePage() {
  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Voltar</Link>
      </p>
      <h1 className="auth-minimal-title">Política de privacidade</h1>
      <p className="auth-minimal-lede">
        Como tratamos informações na mila. — assistente de negócios no WhatsApp
        para lojas de joias e semijoias. Última atualização: {ATUALIZADO_EM}.
      </p>
      <div className="legal-body">
        <h2>1. Quem somos</h2>
        <p>
          Esta política descreve o tratamento de dados no site{" "}
          <strong>milaai.com.br</strong>, no workspace web e no canal WhatsApp da{" "}
          <strong>mila.</strong>. O serviço é operado pela {CONTROLADOR_NOME}{" "}
          {CONTROLADOR_CNPJ === null
            ? "— a empresa ainda não está constituída, e por isso não há CNPJ a informar. Quando estiver, ele será publicado aqui."
            : `(CNPJ ${CONTROLADOR_CNPJ}).`}
        </p>
        <p>
          Na relação com a loja — conta, plano e cobrança — a mila. é a{" "}
          <strong>controladora</strong> dos dados. Nos dados que a loja cadastra
          ou envia sobre a própria operação (custos, notas, fornecedores,
          destinatários que aparecem na nota), a mila. atua como{" "}
          <strong>operadora</strong>, a serviço da loja, que é quem decide o que
          registrar.
        </p>
        <p>
          <strong>Encarregado (DPO):</strong> a ANPD dispensa o agente de pequeno
          porte da indicação formal de encarregado (Resolução CD/ANPD nº
          2/2022). O canal de comunicação com o titular é obrigatório e existe: é
          o contato no fim desta página, com resposta em até 15 dias.
        </p>

        <h2>2. De quem são os dados</h2>
        <p>Titulares dos dados tratados neste serviço:</p>
        <ul>
          {TITULARES.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>
          A mila. <strong>não mantém CRM</strong>, histórico de vendas a
          consumidores finais nem base de compradores da loja. Mas ela{" "}
          <strong>lê a nota fiscal</strong>, e a nota traz o destinatário —
          nome, CPF/CNPJ e endereço. Esses dados de terceiros são tratados pela
          mila. como operadora, a serviço da loja; a loja é a controladora deles.
        </p>

        <h2>3. O que o serviço faz</h2>
        <ul>
          {FUNCOES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p>{DECISAO_AUTOMATIZADA_TEXTO}</p>
        <p>{DECISAO_AUTOMATIZADA_RESSALVA}</p>

        <h2>4. Para que usamos e com que base legal</h2>
        <ul>
          {BASES_LEGAIS.map((b) => (
            <li key={b.finalidade}>
              <strong>{b.finalidade}</strong> — {b.base}
            </li>
          ))}
        </ul>

        <h2>5. Quais dados são tratados e para onde vão</h2>
        <ul>
          {DADOS_TRATADOS.map((d) => (
            <li key={d.dado}>
              <strong>{d.dado}</strong> — {d.destino}
            </li>
          ))}
        </ul>

        <h2>6. Com quem compartilhamos (subprocessadores)</h2>
        <p>
          Não vendemos dados. Para operar, usamos prestadores que processam
          informações <em>em nosso nome e por nossa conta</em>:
        </p>
        <ul>
          {SUBCONTROLADORES.map((s) => (
            <li key={s.nome}>
              <strong>{s.nome}</strong> ({s.pais}) — {s.papel}
            </li>
          ))}
        </ul>
        <p>{TRANSFERENCIA_INTERNACIONAL}</p>

        <h2>7. Google: o que a mila acessa e o que não acessa</h2>
        <p>{GOOGLE_O_QUE_ACESSA}</p>
        <p>
          Escopos solicitados ao conectar:{" "}
          {GOOGLE_ESCOPOS.map((e) =>
            e.replace("https://www.googleapis.com/auth/", "auth/"),
          ).join(", ")}
          .
        </p>
        <p>{GOOGLE_LIMITED_USE}</p>

        <h2>8. Integrações que a loja conecta</h2>
        <p>
          Quando a lojista autoriza um conector, a mila. age na conta{" "}
          <em>em nome dela</em>, nos limites da permissão concedida. Isso é
          distinto dos subprocessadores acima.
        </p>
        <p>
          <strong>Disponíveis hoje:</strong>
        </p>
        <ul>
          {CONECTORES_DISPONIVEIS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p>
          <strong>Disponíveis, com validação em andamento:</strong>
        </p>
        <ul>
          {CONECTORES_VALIDACAO_PENDENTE.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p>{NAO_PRONTOs_FRASE}</p>

        <h2>9. Por quanto tempo guardamos</h2>
        <ul>
          {RETENCAO.map((r) => (
            <li key={r.item}>
              <strong>{r.item}</strong> — {r.praticado}
              {r.alvo !== "não definido" ? ` Alvo: ${r.alvo}.` : ""}
            </li>
          ))}
        </ul>
        <p>
          {RETENCAO_NOTA}
          {EXPURGO_AUTOMATICO_ATIVO
            ? ""
            : " Especificamente: a rotina automática de expurgo ainda não está no ar."}
        </p>

        <h2>10. Isolamento entre lojas</h2>
        <ul>
          {ISOLAMENTO.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        <h2>11. Seus direitos (LGPD)</h2>
        <p>Você pode pedir:</p>
        <ul>
          {DIREITOS.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p>
          Os pedidos são atendidos pelo e-mail{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>, em
          até 15 dias, prorrogáveis na forma da LGPD. Também é possível reclamar
          à ANPD.
        </p>

        <h2>12. Segurança</h2>
        <p>
          Controles proporcionais ao porte do serviço: segredos de autenticação
          fora do navegador, acesso por lista de números autorizados, limite de
          tentativas, código de verificação guardado apenas em hash com salt,
          credenciais de integração em cofre cifrado e sessão de login com
          registro por loja.
        </p>
        <p>
          Nenhum sistema é perfeito, e respostas de IA podem errar: revise preço,
          estoque e textos importantes antes de usar.
        </p>

        <h2>13. O que não fazemos</h2>
        <ul>
          {NAO_FEITO.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <h2>14. Crianças</h2>
        <p>
          O serviço é voltado a titulares de negócio adultos. Não coletamos de
          forma consciente dados de menores de 18 anos.
        </p>

        <h2>15. Contato</h2>
        <p>
          Privacidade e dados:{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>.
          Instagram: {INSTAGRAM}.
        </p>

        <h2>16. Mudanças</h2>
        <p>
          Podemos atualizar esta política. A versão vigente fica sempre nesta
          página, com a data no topo. Mudanças materiais serão comunicadas de
          forma razoável (site e/ou WhatsApp).
        </p>
      </div>
    </div>
  );
}
