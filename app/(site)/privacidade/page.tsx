import Link from "next/link";

import {
  ATUALIZADO_EM,
  BASES_LEGAIS,
  CONECTORES_DISPONIVEIS,
  CONECTORES_VALIDACAO_PENDENTE,
  CONTATO_PRIVACIDADE,
  CONTROLADOR_CNPJ,
  CONTROLADOR_ENDERECO,
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
    "Como a mila. trata dados: WhatsApp, site, login, IA, Google, Meta e transferência internacional.",
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
          <strong>mila.</strong>. O serviço é operado pela {CONTROLADOR_NOME} (CNPJ{" "}
          {CONTROLADOR_CNPJ}). Endereço: {CONTROLADOR_ENDERECO}.
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
          <strong>Encarregado (DPO):</strong> como agente de tratamento de pequeno
          porte (Resolução CD/ANPD nº 2/2022), a mila. não é obrigada a indicar um
          encarregado. O canal do titular é o e-mail{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>, com
          resposta em até 15 dias.
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
              <strong>{s.nome}</strong> ({s.pais}) — {s.papel}{" "}
              {s.tocaDadoDoGoogle === false ? (
                <em>Não recebe dado das APIs do Google.</em>
              ) : (
                <em>Recebe do Google: {s.tocaDadoDoGoogle}.</em>
              )}
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

        <h2>8. Meta (Facebook e Instagram): o que a mila acessa</h2>
        <p>
          A lojista pode, se quiser, conectar a conta empresarial dela na Meta
          pelo Login do Facebook para Empresas. A mila. existe para sincronizar
          as peças cadastradas na mila. com o catálogo da loja na Meta, que é
          usado no Instagram Shopping e no Facebook. Essa conexão é opcional e
          só acontece com a autorização expressa da lojista.
        </p>
        <p>
          <strong>Permissões solicitadas:</strong> catalog_management (criar,
          atualizar e remover itens do catálogo da loja) e business_management
          (identificar o portfólio empresarial e os catálogos aos quais a lojista
          deu acesso).
        </p>
        <p>
          <strong>Dados recebidos da Meta:</strong> identificador da conta e nome
          do usuário que autorizou; ID e nome do portfólio empresarial; ID e nome
          dos catálogos autorizados; token de acesso; e os itens do catálogo e o
          status de cada um (por exemplo, se foi aprovado ou rejeitado).
        </p>
        <p>
          <strong>Dados enviados à Meta:</strong> os dados das peças que a
          própria loja cadastrou na mila., como nome, descrição, preço,
          disponibilidade, fotos, marca, condição e link.
        </p>
        <p>
          <strong>Uso:</strong> apenas para sincronizar e exibir o status do
          catálogo para a própria lojista. <strong>Não</strong> usamos dados da
          Meta para publicidade, criação de perfis, venda ou treinamento de
          modelos de IA. <strong>Não</strong> acessamos mensagens, seguidores,
          publicações nem dados de clientes da loja.
        </p>
        <p>
          <strong>Compartilhamento:</strong> os dados da Meta não são vendidos nem
          cedidos. Eles ficam guardados na nossa infraestrutura de hospedagem,
          listada na seção de subprocessadores, só para operar a sincronização.
        </p>
        <p>
          <strong>Retenção:</strong> o token e os IDs ficam guardados enquanto a
          integração estiver ativa. Eles são apagados em até 30 dias depois que
          a lojista desconecta a mila. (pelo painel ou removendo o app nas
          configurações do Facebook) ou pede a exclusão. Os itens publicados no
          catálogo pertencem à loja e continuam na conta Meta dela até que ela os
          remova.
        </p>
        <p>
          <strong>Exclusão:</strong> veja as instruções em{" "}
          <a href="https://milaai.com.br/exclusao-de-dados">https://milaai.com.br/exclusao-de-dados</a>.
        </p>

        <h2>9. Integrações que a loja conecta</h2>
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

        <h2>10. Por quanto tempo guardamos</h2>
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

        <h2>11. Isolamento entre lojas</h2>
        <ul>
          {ISOLAMENTO.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        <h2>12. Seus direitos (LGPD)</h2>
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
        <p>
          Para excluir os dados, inclusive os da integração com a Meta, siga as{" "}
          <Link href="/exclusao-de-dados">instruções de exclusão de dados</Link>.
        </p>

        <h2>13. Segurança</h2>
        <p>
          Controles proporcionais ao porte do serviço: segredos de autenticação
          fora do navegador, acesso por lista de números autorizados, limite de
          tentativas, código de verificação guardado apenas em hash com salt,
          credenciais de integração em cofre cifrado e sessão de login com
          registro por loja.
        </p>
        <p>
          Cópia de segurança: uma vez por dia, os dados guardados no nosso
          servidor são cifrados ali mesmo e enviados à Cloudflare. A chave que
          abre essas cópias não fica no servidor. Cada cópia é guardada por 28
          dias e então descartada.
        </p>
        <p>
          Nenhum sistema é perfeito, e respostas de IA podem errar: revise preço,
          estoque e textos importantes antes de usar.
        </p>

        <h2>14. O que não fazemos</h2>
        <ul>
          {NAO_FEITO.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <h2>15. Crianças</h2>
        <p>
          O serviço é voltado a titulares de negócio adultos. Não coletamos de
          forma consciente dados de menores de 18 anos.
        </p>

        <h2>16. Contato</h2>
        <p>
          Controlador: {CONTROLADOR_NOME}, CNPJ {CONTROLADOR_CNPJ}. Endereço:{" "}
          {CONTROLADOR_ENDERECO}.
        </p>
        <p>
          Privacidade e dados:{" "}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`}>{CONTATO_PRIVACIDADE}</a>.
          Instagram: {INSTAGRAM}. Para excluir dados, inclusive os da integração
          com a Meta, siga as{" "}
          <Link href="/exclusao-de-dados">instruções de exclusão de dados</Link>.
        </p>

        <h2>17. Mudanças</h2>
        <p>
          Podemos atualizar esta política. A versão vigente fica sempre nesta
          página, com a data no topo. Mudanças materiais serão comunicadas de
          forma razoável (site e/ou WhatsApp).
        </p>
      </div>
    </div>
  );
}
