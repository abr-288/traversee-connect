// Minimal in-memory SSE broadcaster for newly created contact messages.
// Note: This works per-process (fine for dev / single instance).

const clients = new Set();

function addClient(res) {
  clients.add(res);
}

function removeClient(res) {
  clients.delete(res);
}

function broadcast(event, data) {
  const payload = JSON.stringify(data);
  for (const res of clients) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // Client disconnected (or connection broken) - clean up.
      clients.delete(res);
    }
  }
}

function broadcastMessageCreated(message) {
  broadcast("message_created", {
    id: message.id,
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    read: message.read,
    replied: message.replied,
    createdAt: message.createdAt,
  });
}

module.exports = {
  addClient,
  removeClient,
  broadcastMessageCreated,
};

