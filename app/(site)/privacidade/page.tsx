import Link from "next/link";

import {
  ATUALIZADO_EM,
  CONECTORES_DISPONIVEIS,
  CONECTORES_NAO_PRONTOs,
  CONECTORES_VALIDACAO_PENDENTE,
  CONTATO_PRIVACIDADE,
  DADOS_TRATADOS,
  DECISAO_AUTOMATIZADA_TEXTO,
  EXPURGO_AUTOMATICO_ATIVO,
  FUNCOES,
  INSTAGRAM,
  NAO_FEITO,
  RETENCAO,
  RETENCAO_NOTA,
  SUBCONTROLADORES,
  TITULARES,
} from "@/lib/legal";

export const metadata = {
  title: "Política de privacidade — mila.",
  description:
    "Como a mila. trata dados: WhatsApp, site, login, IA, integrações e transferência internacional.",
};

export default function PrivacidadePage() {
  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Voltar</Link>
      </p>
      <h1 className="auth-minimal-title">Política de privacidade</h1>
      <p className="auth-minimal-lede">
        Como tratamos informações no piloto da mila. — assistente de negócios no
        WhatsApp para lojas de joias e semijoias. Última atualização:{" "}
        {ATUALIZADO_EM}.
      </p>
      <div className="legal-body">
        <h2>1. Quem somos</h2>
        <p>
          Esta política descreve o tratamento de dados no site{" "}
          <strong>milaai.com.br</strong>, no workspace web e no canal WhatsApp
          da <strong>mila.</strong> O serviço é operado pela equipe fundadora sob
          a marca mila.; razão social e CNPJ serão publicados aqui quando a
          empresa estiver constituída.
        </p>
        <p>
          Na relação com a loja — conta, plano e cobrança — a mila. é a{" "}
          <strong>controladora</strong> dos dados. Nos dados que a loja cadastra
          sobre a própria operação (custos, notas, fornecedores), a mila. atua
          como <strong>operadora</strong>, a serviço da loja, que é quem decide
          o que registrar.
        </p>
        <p>
          <strong>Encarregado (DPO):</strong> a ANPD dispensou o agente de
          pequeno porte da indicação formal de encarregado. O canal de
          comunicação com o titular é obrigatório e existe — é o contato no fim
          desta página, com resposta em até 15 dias.
        </p>

        <h2>2. De quem são os dados</h2>
        <p>Neste serviço, os titulares são:</p>
        <ul>
          {TITULARES.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>
          A mila. <strong>não trata dados de clientes finais da loja</strong>:
          não há CRM, histórico de vendas a consumidores nem base de compradores.
          O escopo é a operação interna da loja.
        </p>

        <h2>3. O que o serviço faz</h2>
        <ul>
          {FUNCOES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p>{DECISAO_AUTOMATIZADA_TEXTO}</p>

        <h2>4. Quais dados são tratados e para onde vão</h2>
        <ul>
          {DADOS_TRATADOS.map((d) => (
            <li key={d.dado}>
              <strong>{d.dado}</strong> — {d.destino}
            </li>
          ))}
        </ul>

        <h2>5. Com quem compartilhamos (subprocessadores)</h2>
        <p>
          Não vendemos dados. Para operar, usamos prestadores que processam
          informações <em>em nosso nome e por nossa conta</em>. São eles:
        </p>
        <ul>
          {SUBCONTROLADORES.map((s) => (
            <li key={s.nome}>
              <strong>{s.nome}</strong> — {s.papel}
            </li>
          ))}
        </ul>
        <p>
          Vários desses prestadores processam dados{" "}
          <strong>fora do Brasil</strong>, principalmente nos Estados Unidos.
          Isso é uma transferência internacional de dados (LGPD, art. 33),
          amparada em cláusulas contratuais e no legítimo interesse de operar o
          serviço.
        </p>

        <h2>6. Integrações que a loja conecta</h2>
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
        <p>
          <strong>Anunciados e ainda não disponíveis:</strong>{" "}
          {CONECTORES_NAO_PRONTOs.join(", ")}. A tela de conexão existe, mas o
          acesso ainda não foi habilitado. Não conte com eles para a operação da
          sua loja por enquanto.
        </p>

        <h2>7. Por quanto tempo guardamos</h2>
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
            : " Importante ser transparente: a rotina automática de expurgo ainda não está no ar — enquanto isso, a exclusão é feita pela equipe sob pedido."}
        </p>

        <h2>8. Isolamento entre lojas</h2>
        <p>
          Cada loja é um espaço separado: operadores da mesma loja compartilham o
          ambiente; lojas diferentes não veem dados umas das outras. O acesso é
          restrito por lista de números autorizados.
        </p>

        <h2>9. Seus direitos (LGPD)</h2>
        <p>
          Você pode pedir confirmação de tratamento, acesso, correção,
          anonimização, portabilidade (quando aplicável), eliminação e
          informação sobre compartilhamentos. Os pedidos são atendidos pelo
          e-mail{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>,
          em até 15 dias, prorrogáveis na forma da LGPD. Também é possível
          reclamar à ANPD.
        </p>

        <h2>10. Segurança</h2>
        <p>
          Aplicamos controles proporcionais ao porte do serviço: segredos de
          autenticação fora do navegador, acesso por lista de números
          autorizados, limite de tentativas, senhas e códigos guardados apenas
          em hash, credenciais de integração em cofre cifrado e isolamento entre
          lojas.
        </p>
        <p>
          Nenhum sistema é perfeito, e respostas de IA podem errar: revise preço,
          estoque e textos importantes antes de usar.
        </p>

        <h2>11. O que não fazemos</h2>
        <ul>
          {NAO_FEITO.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <h2>12. Crianças</h2>
        <p>
          O serviço é voltado a titulares de negócio adultos. Não coletamos de
          forma consciente dados de menores de 18 anos.
        </p>

        <h2>13. Mudanças</h2>
        <p>
          Podemos atualizar esta política. A versão vigente fica sempre nesta
          página, com a data no topo. Mudanças materiais serão comunicadas de
          forma razoável (site e/ou WhatsApp).
        </p>

        <h2>14. Contato</h2>
        <p>
          Privacidade e dados:{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>.
          Instagram: {INSTAGRAM}.
        </p>
      </div>
    </div>
  );
}
