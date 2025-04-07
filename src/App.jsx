import { useEffect, useState } from "react";
import "./App.css";

// Función auxiliar para validar enlaces
const enlaceValido = (url) => url && url.startsWith("http");

// Componente para paginar y mostrar el listado de productos
function ProductoList({ productos, itemsPerPage = 3 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductos = productos.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      <ul>
        {paginatedProductos.map((item) => (
          <li key={item.ID}>
            <p className="descripcion">
              {item.DESCRIPCIÓN || "Sin descripción disponible"}
            </p>
            {enlaceValido(item["ENLACE DE LA PUBLICACIÓN"]) ? (
              <a
                href={item["ENLACE DE LA PUBLICACIÓN"]}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver publicación
              </a>
            ) : (
              <span className="no-enlace">⚠️ Enlace no disponible</span>
            )}
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="paginacion">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [responsablesUnicos, setResponsablesUnicos] = useState([]);

  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((jsonData) => {
        setDatos(jsonData);
        const responsables = [
          ...new Set(jsonData.map((item) => item.RESPONSABLE?.trim())),
        ];
        setResponsablesUnicos(responsables.sort());
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []);

  // Filtra los datos según la búsqueda
  const datosFiltrados = busqueda.trim()
    ? datos.filter((item) =>
        item.RESPONSABLE?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  // Agrupa los datos filtrados por responsable
  const agrupadosPorResponsable = datosFiltrados.reduce((acum, item) => {
    const responsable = item.RESPONSABLE?.trim();
    if (!acum[responsable]) {
      acum[responsable] = [];
    }
    acum[responsable].push(item);
    return acum;
  }, {});

  const handleSelect = (e) => {
    const value = e.target.value;
    setBusqueda(value);
  };

  const handleClear = () => {
    setBusqueda("");
  };

  return (
    <div className="container">
      <h1>🔍 Buscar por Responsable</h1>

      <div className="search-wrapper">
        <div className="search-controls">
          <select onChange={handleSelect} value={busqueda}>
            <option value="">-- Selecciona un responsable --</option>
            {responsablesUnicos.map((r, idx) => (
              <option key={idx} value={r}>
                {r}
              </option>
            ))}
          </select>

          <div className="input-clear-wrapper">
            <input
              type="text"
              placeholder="O escribe el nombre del responsable"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar por nombre del responsable"
            />
            {busqueda && (
              <button
                className="clear-btn"
                onClick={handleClear}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {busqueda.trim() !== "" && (
        <div className="resultados">
          {Object.keys(agrupadosPorResponsable).length > 0 ? (
            Object.entries(agrupadosPorResponsable).map(
              ([responsable, registros], idx) => {
                // Agrupa los registros por tipo de producto
                const agrupadosPorProducto = registros.reduce((acum, item) => {
                  const tipo = item["TIPO DE PRODUCTO"];
                  if (!acum[tipo]) {
                    acum[tipo] = [];
                  }
                  acum[tipo].push(item);
                  return acum;
                }, {});
                return (
                  <div key={idx} className="responsable-group">
                    <h2>{responsable}</h2>
                    <p>
                      Total de tipos de producto:{" "}
                      {Object.keys(agrupadosPorProducto).length}
                    </p>
                    {Object.entries(agrupadosPorProducto).map(
                      ([tipo, productos], i) => (
                        <div key={i} className="producto-group">
                          <h3>
                            {tipo} ({productos.length} registro
                            {productos.length > 1 ? "s" : ""})
                          </h3>
                          {/* Se utiliza el componente de paginación para cada grupo de productos */}
                          <ProductoList productos={productos} itemsPerPage={5} />
                        </div>
                      )
                    )}
                  </div>
                );
              }
            )
          ) : (
            <p className="no-resultados">
              ❌ No se encontraron responsables que coincidan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
