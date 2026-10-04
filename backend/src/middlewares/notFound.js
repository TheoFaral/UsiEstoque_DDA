function notFound(request, response) {
  return response.status(404).json({
    error: "Rota não encontrada.",
    method: request.method,
    path: request.originalUrl,
  });
}

module.exports = notFound;
