document.addEventListener("DOMContentLoaded", () => {
  // --- Incident Reports State & Logic ---
  let incidents = [
    {
      id: 1,
      reporter: "Prof. Marcos Silva",
      lab: "Laboratório de Redes (Lab 1)",
      category: "Computador sem Conexão (Internet)",
      desc: "Bancada 12 está sem obter IP via DHCP, cabo de rede parece intacto.",
      status: "Em Manutenção",
      date: "21/05/2026",
      protocol: "#TK-394857"
    },
    {
      id: 2,
      reporter: "Ana Souza (Aluna)",
      lab: "Laboratório de Hardware (Lab 3)",
      category: "Periférico Quebrado (Teclado/Mouse)",
      desc: "Teclado da bancada 4 está com a tecla Enter quebrada.",
      status: "Pendente",
      date: "21/05/2026",
      protocol: "#TK-483921"
    },
    {
      id: 3,
      reporter: "Carlos Lima (Aluno)",
      lab: "Biblioteca / Computadores",
      category: "Sistema Operacional Travado/Erro",
      desc: "Computador 2 travado na tela azul da morte após inicialização.",
      status: "Resolvido",
      date: "20/05/2026",
      protocol: "#TK-128472"
    }
  ];

  // Load from localStorage if present
  if (localStorage.getItem("portal_incidents")) {
    try {
      incidents = JSON.parse(localStorage.getItem("portal_incidents"));
    } catch (e) {
      console.error("Error reading incidents from localStorage", e);
    }
  }

  const incidentForm = document.getElementById("incident-form");
  const reporterNameInput = document.getElementById("reporter-name");
  const labSelect = document.getElementById("lab-select");
  const categorySelect = document.getElementById("category-select");
  const incidentDescInput = document.getElementById("incident-desc");

  const incidentListElement = document.getElementById("incident-list-element");
  const incidentStatsBadge = document.getElementById("incident-stats");
  const activeTicketsCounter = document.getElementById("active-tickets-counter");

  // Modal elements
  const ticketModal = document.getElementById("ticket-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const ticketSerialVal = document.getElementById("ticket-serial-val");
  const ticketReporterVal = document.getElementById("ticket-reporter-val");
  const ticketLabVal = document.getElementById("ticket-lab-val");
  const ticketCatVal = document.getElementById("ticket-cat-val");
  const ticketDescVal = document.getElementById("ticket-desc-val");

  function saveIncidents() {
    localStorage.setItem("portal_incidents", JSON.stringify(incidents));
  }

  function renderIncidents() {
    if (!incidentListElement) return;

    incidentListElement.innerHTML = "";

    const activeTickets = incidents.filter(i => i.status !== "Resolvido").length;
    if (activeTicketsCounter) activeTicketsCounter.textContent = activeTickets;
    if (incidentStatsBadge) incidentStatsBadge.textContent = `${incidents.length} chamado(s)`;

    if (incidents.length === 0) {
      incidentListElement.innerHTML = `<li class="incident-placeholder">Nenhum chamado aberto. Tudo limpo por aqui!</li>`;
      return;
    }

    // Sort by id descending so newest shows first
    const sortedIncidents = [...incidents].sort((a, b) => b.id - a.id);

    sortedIncidents.forEach(item => {
      const li = document.createElement("li");
      li.className = `incident-item status-${item.status.toLowerCase().replace(/\s+/g, '-')}`;
      
      li.innerHTML = `
        <div class="incident-item-header">
          <span class="incident-protocol">${escapeHTML(item.protocol)}</span>
          <span class="incident-status-pill">${escapeHTML(item.status)}</span>
        </div>
        <div class="incident-item-body">
          <strong>${escapeHTML(item.lab)}</strong>
          <span class="incident-category">${escapeHTML(item.category)}</span>
          <p class="incident-desc-preview">${escapeHTML(item.desc)}</p>
        </div>
        <div class="incident-item-footer">
          <span>Relatado por: ${escapeHTML(item.reporter)}</span>
          <span>Data: ${escapeHTML(item.date)}</span>
        </div>
      `;
      
      incidentListElement.appendChild(li);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  if (incidentForm) {
    incidentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const reporter = reporterNameInput.value.trim();
      const lab = labSelect.value;
      const category = categorySelect.value;
      const desc = incidentDescInput.value.trim();

      if (!reporter || !desc) return;

      // Date string
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      // Protocol
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const protocolStr = `#TK-${randomNum}`;

      const newIncident = {
        id: Date.now(),
        reporter,
        lab,
        category,
        desc,
        status: "Pendente",
        date: dateStr,
        protocol: protocolStr
      };

      incidents.push(newIncident);
      saveIncidents();
      renderIncidents();

      // Clear Form
      reporterNameInput.value = "";
      incidentDescInput.value = "";

      // Populate Modal & Show
      if (ticketSerialVal) ticketSerialVal.textContent = protocolStr;
      if (ticketReporterVal) ticketReporterVal.textContent = reporter;
      if (ticketLabVal) ticketLabVal.textContent = lab;
      if (ticketCatVal) ticketCatVal.textContent = category;
      if (ticketDescVal) ticketDescVal.textContent = desc;

      if (ticketModal) {
        ticketModal.classList.add("active");
      }
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
      if (ticketModal) ticketModal.classList.remove("active");
    });
  }

  if (ticketModal) {
    ticketModal.addEventListener("click", (e) => {
      if (e.target === ticketModal) {
        ticketModal.classList.remove("active");
      }
    });
  }

  // --- Voting Simulator Logic ---
  let votes = {
    A: 45,
    B: 38
  };

  if (localStorage.getItem("portal_votes")) {
    try {
      votes = JSON.parse(localStorage.getItem("portal_votes"));
    } catch (e) {
      console.error("Error reading votes from localStorage", e);
    }
  }

  const voteButtons = document.querySelectorAll(".vote-action-btn");
  const countA = document.getElementById("count-candidate-a");
  const countB = document.getElementById("count-candidate-b");
  const pctA = document.getElementById("pct-candidate-a");
  const pctB = document.getElementById("pct-candidate-b");
  const fillA = document.getElementById("fill-candidate-a");
  const fillB = document.getElementById("fill-candidate-b");

  function saveVotes() {
    localStorage.setItem("portal_votes", JSON.stringify(votes));
  }

  function updateVotingUI() {
    const totalVotes = votes.A + votes.B;
    const percentageA = totalVotes === 0 ? 0 : Math.round((votes.A / totalVotes) * 100);
    const percentageB = totalVotes === 0 ? 0 : Math.round((votes.B / totalVotes) * 100);

    if (countA) countA.textContent = `${votes.A} votos`;
    if (countB) countB.textContent = `${votes.B} votos`;

    if (pctA) pctA.textContent = `${percentageA}%`;
    if (pctB) pctB.textContent = `${percentageB}%`;

    if (fillA) fillA.style.width = `${percentageA}%`;
    if (fillB) fillB.style.width = `${percentageB}%`;
  }

  voteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const candidate = btn.getAttribute("data-candidate");
      if (candidate === "A" || candidate === "B") {
        votes[candidate]++;
        saveVotes();
        updateVotingUI();

        // Simulate disable after voting
        voteButtons.forEach(b => {
          b.disabled = true;
          b.textContent = "Votado";
          b.style.opacity = "0.5";
        });
        
        // Show thank you banner inside cell
        const meta = document.querySelector(".vote-meta");
        if (meta) {
          meta.innerHTML = "🎉 <strong>Voto registrado com sucesso!</strong> Obrigado por participar.";
          meta.style.color = "var(--primary)";
        }
      }
    });
  });

  // Initial runs
  renderIncidents();
  updateVotingUI();
});
