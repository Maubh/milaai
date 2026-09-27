import Link from "next/link";

export const metadata = {
  title: "Política de privacidade — mila",
  description:
    "Como a mila. trata dados no piloto: WhatsApp, site, OTP e subprocessadores.",
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
        WhatsApp para lojas de joias e semijoias. Última atualização: 26 de
        setembro de 2026.
      </p>
      <div className="legal-body">
        <h2>1. Quem somos</h2>
        <p>
          Esta política descreve o tratamento de dados no site{" "}
          <strong>milaai.com.br</strong>, no workspace web e no canal WhatsApp
          da <strong>mila.</strong> (mila.ai). Neste piloto, o serviço é
          operado pela equipe fundadora sob a marca mila.; razão social e CNPJ
          serão atualizados aqui quando a empresa estiver constituída.
        </p>
        <p>
          Contato de privacidade:{" "}
          <a href="mailto:privacy@milaai.com.br">privacy@milaai.com.br</a>.
        </p>

        <h2>2. Escopo deste piloto</h2>
        <p>
          O acesso está limitado a founders e números na allowlist. Partes do
          site ainda são demonstrativas (por exemplo, mockups e alguns
          conectores “em breve”). O login com OTP por WhatsApp, quando ativo
          para o seu número, é um fluxo real: o telefone chega aos nossos
          servidores e ao provedor de mensagem.
        </p>

        <h2>3. O que coletamos</h2>
        <p>Dependendo de como você usa a mila., podemos tratar:</p>
        <ul>
          <li>
            <strong>Dados de conta e contato</strong> — número de WhatsApp
            (E.164), código OTP, plano/allowlist e status de verificação.
          </li>
          <li>
            <strong>Conteúdo que você envia no WhatsApp</strong> — mensagens,
            fotos de peças, notas fiscais (XML/PDF), perguntas sobre preço,
            estoque, fornecedores ou marketing.
          </li>
          <li>
            <strong>Dados de uso do site</strong> — páginas visitadas, eventos
            técnicos de login, IP e sinais de dispositivo na medida necessária
            para segurança (incluindo verificação anti-robô).
          </li>
          <li>
            <strong>Dados de integrações (quando você conectar)</strong> —
            tokens e metadados necessários para agir na sua conta (Google
            Workspace, Notion, Jueri, Olist, Bling etc.). Tokens ficam em cofre
            server-side; a interface só mostra status de conexão.
          </li>
        </ul>

        <h2>4. Para que usamos</h2>
        <ul>
          <li>Autenticar o acesso (OTP) e manter sua sessão de loja.</li>
          <li>
            Prestar o serviço: precificação, leitura de notas, respostas no
            WhatsApp e funções do plano contratado/piloto.
          </li>
          <li>Segurança: anti-abuso, rate limit, auditoria mínima e suporte.</li>
          <li>Cumprir obrigações legais e pedidos legítimos de autoridade.</li>
          <li>
            Melhorar o produto com métricas agregadas ou dados desidentificados,
            sem vender sua base.
          </li>
        </ul>
        <p>
          <strong>Treino de modelos:</strong> não usamos o conteúdo da sua loja
          (mensagens, NF-e, fotos, custos) para treinar modelos de fundação de
          terceiros, na medida do que o contrato e as configurações do provedor
          de IA permitirem. O provedor específico de LLM ainda pode ser
          definido; quando for escolhido, atualizaremos esta página.
        </p>

        <h2>5. Com quem compartilhamos (subprocessadores)</h2>
        <p>
          Não vendemos seus dados. Para operar o piloto, usamos prestadores que
          processam informações em nosso nome, por exemplo:
        </p>
        <ul>
          <li>
            <strong>Provedor de modelo de IA (LLM) — a definir</strong> —
            recebe trechos necessários do prompt (texto, descrição de imagem ou
            dados já minimizados) para gerar a resposta.
          </li>
          <li>
            <strong>MegaAPI</strong> — transporte da mensagem WhatsApp (texto e
            mídia).
          </li>
          <li>
            <strong>Vercel</strong> — hospedagem do site e do workspace.
          </li>
          <li>
            <strong>Cloudflare</strong> — DNS, túnel e proteção do endpoint de
            autenticação/WhatsApp.
          </li>
          <li>
            <strong>Provedores de busca/visão</strong> (quando ligados, ex.:
            pesquisa de preço) — apenas o necessário para a tarefa.
          </li>
        </ul>
        <p>
          Quando você autorizar um conector (Google, Notion, ERP etc.), a mila.
          acessa essa conta <em>em seu nome</em>, nos limites da permissão que
          você conceder. Isso é distinto de um subprocessador nosso: é a sua
          integração.
        </p>

        <h2>6. Isolamento entre lojas</h2>
        <p>
          Tratamos cada loja como um espaço separado. Telefones de operadores da
          mesma loja podem compartilhar o mesmo ambiente; lojas diferentes não
          devem ver dados umas das outras. Pedidos de suporte feitos pelos
          founders, se precisarem acessar uma conta, devem ser auditáveis.
        </p>

        <h2>7. Retenção</h2>
        <p>Enquanto o piloto estiver ativo, a proposta de guarda é:</p>
        <ul>
          <li>Hashes de OTP: minutos.</li>
          <li>Histórico operacional de chat: até cerca de 90 dias, ou até exclusão.</li>
          <li>NF-e / XML processados: até cerca de 180 dias, ou até exclusão.</li>
          <li>Fotos de peça: até cerca de 90 dias, ou até exclusão.</li>
          <li>Logs técnicos já redigidos: até cerca de 30 dias.</li>
          <li>Tokens de integração: até você desconectar ou pedirmos revogação.</li>
        </ul>
        <p>
          A mila. não substitui a obrigação da loja de guardar documentos
          fiscais nos prazos legais.
        </p>

        <h2>8. Seus direitos (LGPD)</h2>
        <p>
          Você pode pedir confirmação de tratamento, acesso, correção,
          anonimização, portabilidade (quando aplicável), eliminação e
          informação sobre compartilhamentos. No piloto, esses pedidos são
          atendidos pela equipe fundadora pelo e-mail{" "}
          <a href="mailto:privacy@milaai.com.br">privacy@milaai.com.br</a>, em
          prazo razoável. Também é possível reclamar à ANPD.
        </p>

        <h2>9. Segurança</h2>
        <p>
          Aplicamos controles proporcionais ao piloto: segredos fora do
          navegador, allowlist, confirmação antes de ações que alteram dados,
          redação de informações sensíveis em logs e respostas, e menor
          privilégio por plano. Nenhum sistema é perfeito; agentes de IA podem
          errar ou interpretar mal um pedido — confirme ações importantes.
        </p>

        <h2>10. Crianças</h2>
        <p>
          O serviço é voltado a titulares de negócio adultos. Não coletamos de
          forma consciente dados de menores de 18 anos.
        </p>

        <h2>11. Mudanças</h2>
        <p>
          Podemos atualizar esta política. A versão vigente fica sempre nesta
          página, com a data no topo. Mudanças materiais no piloto serão
          comunicadas de forma razoável (site e/ou WhatsApp).
        </p>

        <h2>12. Contato</h2>
        <p>
          Dúvidas:{" "}
          <a href="mailto:privacy@milaai.com.br">privacy@milaai.com.br</a>.
          Instagram: @usemila.ai.
        </p>
      </div>
    </div>
  );
}
