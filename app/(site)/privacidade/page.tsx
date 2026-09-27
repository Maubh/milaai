import Link from "next/link";

export const metadata = {
  title: "Política de privacidade — mila.",
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
        WhatsApp para lojas de joias e semijoias. Última atualização: 27 de
        setembro de 2026.
      </p>
      <div className="legal-body">
        <h2>1. Quem somos</h2>
        <p>
          Esta política descreve o tratamento de dados no site{" "}
          <strong>milaai.com.br</strong>, no workspace web e no canal WhatsApp
          da <strong>mila.</strong> Neste piloto, o serviço é operado pela
          equipe fundadora sob a marca mila.; razão social e CNPJ serão
          atualizados aqui quando a empresa estiver constituída. Não há
          encarregado (DPO) nomeado nesta fase: o contato de privacidade é a
          própria equipe fundadora.
        </p>
        <p>
          Contato:{" "}
          <a href="mailto:privacy@milaai.com.br">privacy@milaai.com.br</a>{" "}
          (encaminhado à equipe). Instagram: @usemila.ai.
        </p>

        <h2>2. Escopo deste piloto</h2>
        <p>
          O acesso é restrito a founders e números autorizados (lista
          controlada). Partes do site ainda são demonstrativas, como os mockups.
          O login com código por WhatsApp, quando
          liberado para o seu número, é um fluxo real: o telefone chega aos
          nossos servidores e ao provedor de mensagem.
        </p>

        <h2>3. O que coletamos</h2>
        <p>Dependendo de como você usa a mila., podemos tratar:</p>
        <ul>
          <li>
            <strong>Dados de conta e contato</strong> — número de WhatsApp,
            código de verificação de vida curta, indicação de plano/autorização
            e status de verificação.
          </li>
          <li>
            <strong>Conteúdo que você envia no WhatsApp</strong> — mensagens,
            fotos de peças, notas fiscais (XML/PDF), perguntas sobre preço,
            estoque, fornecedores ou marketing.
          </li>
          <li>
            <strong>Dados de uso do site</strong> — páginas visitadas, eventos
            técnicos de login, IP e sinais do navegador na medida necessária
            para segurança, inclusive verificação anti-robô da Cloudflare
            (Turnstile) no login.
          </li>
          <li>
            <strong>Dados de integrações (quando o recurso estiver ligado e
            você conectar)</strong>{" "}
            — metadados e credenciais necessárias para agir na sua conta
            (Google Workspace, Notion, Jueri, Olist, Bling etc.). A intenção de
            produto é guardar essas credenciais só nos nossos servidores e
            mostrar na interface apenas o status de conexão; isso ainda está em
            implantação.
          </li>
        </ul>
        <p>
          Sobre notas fiscais: a loja é a controladora dos dados fiscais e dos
          dados de clientes/fornecedores que aparecem no documento. A mila. trata
          esse conteúdo como operadora, para prestar o serviço que você pediu.
        </p>

        <h2>4. Para que usamos (bases)</h2>
        <p>
          Em regra, tratamos dados para executar o que você pediu (prestação do
          serviço e autenticação), para segurança anti-abuso e, quando couber,
          para cumprir obrigação legal. Em detalhe:
        </p>
        <ul>
          <li>Autenticar o acesso (código por WhatsApp) e reconhecer sua loja.</li>
          <li>
            Prestar o serviço: precificação, leitura de notas, respostas no
            WhatsApp e funções liberadas no piloto.
          </li>
          <li>
            Segurança: anti-abuso, limite de tentativas e suporte aos
            autorizados.
          </li>
          <li>Cumprir obrigações legais e pedidos legítimos de autoridade.</li>
          <li>
            Melhorar o produto com métricas agregadas ou dados desidentificados,
            sem vender sua base.
          </li>
        </ul>
        <p>
          <strong>Treino de modelos:</strong> a mila. não treina modelo próprio
          com o conteúdo da sua loja (mensagens, NF-e, fotos, custos). Como
          política de produto, não enviamos esse conteúdo a terceiros para
          treinar modelos de fundação. O provedor de modelo de IA ainda será
          escolhido; quando for definido, nomearemos nesta página. Configurações
          e contratos desse provedor serão alinhados a esta política.
        </p>

        <h2>5. Com quem compartilhamos (subprocessadores)</h2>
        <p>
          Não vendemos seus dados. Para operar o piloto, usamos prestadores que
          processam informações em nosso nome, por exemplo:
        </p>
        <ul>
          <li>
            <strong>Provedor de modelo de IA (LLM) — a definir</strong> —
            recebe trechos necessários do pedido (texto, descrição de imagem ou
            dados já reduzidos) para gerar a resposta.
          </li>
          <li>
            <strong>MegaAPI</strong> — transporte da mensagem no WhatsApp (texto
            e mídia). O app WhatsApp / Meta também participa do transporte da
            mensagem que você envia e recebe.
          </li>
          <li>
            <strong>Vercel</strong> — hospedagem do site e do workspace.
          </li>
          <li>
            <strong>Cloudflare</strong> — DNS, túnel, proteção do endpoint de
            autenticação/WhatsApp e verificação anti-robô no login.
          </li>
          <li>
            <strong>Provedores de busca/visão</strong> (quando ligados, ex.:
            pesquisa de preço) — apenas o necessário para a tarefa.
          </li>
        </ul>
        <p>
          Esses prestadores podem processar dados fora do Brasil. Estamos
          formalizando contratos e configurações alinhados a essa prestação
          neste piloto.
        </p>
        <p>
          Quando um conector estiver disponível e você autorizar (Google,
          Notion, ERP etc.), a mila. acessa essa conta <em>em seu nome</em>, nos
          limites da permissão concedida. Isso é a sua integração — distinto dos
          subprocessadores acima.
        </p>

        <h2>6. Separação entre lojas</h2>
        <p>
          A meta do produto é tratar cada loja como um espaço separado:
          operadores da mesma loja podem compartilhar o ambiente; lojas
          diferentes não devem ver dados umas das outras. Esse isolamento está
          sendo reforçado no piloto. A intenção é registrar acessos
          excepcionais de suporte pela equipe fundadora; o registro sistemático
          ainda está em implantação.
        </p>

        <h2>7. Retenção</h2>
        <p>Enquanto o piloto estiver ativo, a proposta de guarda é:</p>
        <ul>
          <li>Código de verificação (OTP): minutos (vida curta).</li>
          <li>Histórico operacional de chat: até cerca de 90 dias, ou até exclusão.</li>
          <li>NF-e / XML processados: até cerca de 180 dias, ou até exclusão.</li>
          <li>Fotos de peça: até cerca de 90 dias, ou até exclusão.</li>
          <li>Logs técnicos: até cerca de 30 dias, com o mínimo necessário.</li>
          <li>
            Credenciais de integração (quando existirem): até você desconectar
            ou pedirmos revogação.
          </li>
        </ul>
        <p>
          Esses prazos são alvo do piloto; a exclusão neste momento é sob
          pedido pelo e-mail de privacidade. A mila. não substitui a obrigação
          da loja de guardar documentos fiscais nos prazos legais.
        </p>

        <h2>8. Seus direitos (LGPD)</h2>
        <p>
          Você pode pedir confirmação de tratamento, acesso, correção,
          anonimização, portabilidade (quando aplicável), eliminação e
          informação sobre compartilhamentos. No piloto, esses pedidos são
          atendidos pela equipe fundadora pelo e-mail{" "}
          <a href="mailto:privacy@milaai.com.br">privacy@milaai.com.br</a>, em
          até 15 dias, prorrogáveis na forma da LGPD. Também é possível
          reclamar à ANPD.
        </p>

        <h2>9. Segurança</h2>
        <p>
          No piloto de hoje aplicamos controles proporcionais: segredos de
          autenticação fora do navegador, acesso por lista de números
          autorizados e limite de tentativas. Estamos implantando confirmação
          antes de ações que alteram dados, redução de dados sensíveis em logs e
          respostas, e privilégio mínimo por plano. Nenhum sistema é perfeito;
          respostas de IA podem errar — revise preço, estoque e textos
          importantes antes de usar.
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
