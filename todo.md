# 2026 Rei - Dashboard de Sinais de Trading

## Funcionalidades Planejadas

### Banco de Dados e Backend
- [x] Schema de banco de dados (sinais, histórico, configurações)
- [x] Tabela de sinais com timestamps e métricas
- [x] Tabela de histórico de operações
- [x] Tabela de configurações de ativos
- [x] API para receber sinais do robô
- [x] API para listar sinais com filtros
- [x] API para estatísticas
- [x] Integração com notifyOwner para alertas

### Dashboard Principal
- [x] Layout responsivo com tema escuro
- [x] Painel de ativos OTC monitorados
- [x] Exibição de sinal em tempo real (CALL/PUT)
- [x] Indicador de confiança (%)
- [x] Indicador de força do sinal
- [x] Horário exato de entrada
- [x] Sistema de notificações visuais

### Análise Técnica
- [x] Exibição de indicadores (EMA, RSI, ADX)
- [x] Padrões de velas detectados
- [x] Razões do sinal
- [x] Visualização de suporte/resistência
- [ ] Gráfico de preço em tempo real

### Histórico e Filtros
- [x] Tabela de histórico de sinais
- [x] Filtro por ativo
- [x] Filtro por direção
- [x] Exportar histórico (CSV)
- [ ] Filtro por período (hoje, semana, mês)
- [ ] Busca por timestamp

### Estatísticas
- [x] Taxa de acerto geral
- [x] Total de sinais gerados
- [x] Sinais por ativo
- [x] Sinais por direção
- [ ] Gráfico de performance
- [ ] Estatísticas por período

### Notificações
- [x] Notificação ao proprietário (>70% confiança)
- [x] Toast com detalhes do sinal
- [ ] Notificação visual quando novo sinal (WebSocket)
- [ ] Som de alerta (opcional)
- [ ] Histórico de notificações

### Integração com Robô
- [x] Endpoint para receber sinais
- [x] Validação de sinais recebidos
- [x] Persistência automática
- [x] Tratamento de erros

### UI/UX
- [x] Tema escuro profissional
- [x] Responsividade mobile/tablet/desktop
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [ ] Animações suaves

### Testes
- [x] Testes unitários do backend (11 testes)
- [ ] Testes de integração
- [ ] Testes de UI

## Progresso

**Status:** Funcionalidades principais implementadas
**Última atualização:** 2025-12-25
**Testes:** 11/11 passando
