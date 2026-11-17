function errorHandler(error, _request, response, _next) {
  console.error(error);

  return response.status(500).json({
    error: "Erro interno do servidor.",
  });
}

module.exports = errorHandler;
