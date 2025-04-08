import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  BarChart,
  Bar,
  Cell as BarCell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

// Función auxiliar para validar enlaces
const enlaceValido = (url) => url && url.startsWith("http");

/* Componente para paginar y mostrar el listado de productos */
function ProductoList({ productos, itemsPerPage = 5 }) {
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
            <h3>{item["TIPO"] || "Sin tipo"}</h3>
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

/* Componente para mostrar una gráfica (con toggle entre pastel y barras) a partir de registros */
function ChartDisplay({ registros }) {
  // Calcula la distribución global por "TIPO DE PRODUCTO"
  const distribution = registros.reduce((acc, item) => {
    const tipo = item["TIPO DE PRODUCTO"];
    if (tipo) {
      acc[tipo] = (acc[tipo] || 0) + 1;
    }
    return acc;
  }, {});
  const chartData = Object.entries(distribution).map(([name, value]) => ({ name, value }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF6699", "#33CCFF"];

  const [chartType, setChartType] = useState("pie");
  const toggleChartType = () => setChartType((prev) => (prev === "pie" ? "bar" : "pie"));

  return (
    <div className="chart-panel">
      <div className="chart-controls">
        <button className="toggle-chart-btn" onClick={toggleChartType}>
          Cambiar a gráfico {chartType === "pie" ? "de barras" : "de pastel"}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === "pie" ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <RechartsLegend />
          </PieChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <BarCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/* Componente para mostrar, para un tipo de producto, la distribución porcentual por responsable */
function ResponsableChartForProducto({ registros }) {
  const total = registros.length;
  const distribution = registros.reduce((acc, item) => {
    const responsable = item.RESPONSABLE?.trim().toUpperCase() || "Sin Responsable";
    acc[responsable] = (acc[responsable] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(distribution)
    .map(([name, count]) => ({ name, value: parseFloat(((count / total) * 100).toFixed(2)) }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF6699", "#33CCFF"];

  const [chartType, setChartType] = useState("pie");
  const toggleChartType = () => setChartType((prev) => (prev === "pie" ? "bar" : "pie"));

  return (
    <div className="chart-panel">
      <div className="chart-controls">
        <button className="toggle-chart-btn" onClick={toggleChartType}>
          Cambiar a gráfico {chartType === "pie" ? "de barras" : "de pastel"}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === "pie" ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={(entry) => `${entry.name}: ${entry.value}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => `${value}%`} />
            <RechartsLegend />
          </PieChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <RechartsTooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <BarCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/* Componente para mostrar gráficos generales por responsables para cada tipo de producto */
function GeneralResponsableChart({ datos }) {
  const groupedByProducto = datos.reduce((acc, item) => {
    const tipo = item["TIPO DE PRODUCTO"] || "Sin Tipo";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(item);
    return acc;
  }, {});

  const [openSections, setOpenSections] = useState({});

  const toggleSection = (tipo) => {
    setOpenSections((prev) => {
      const newSections = {};
      newSections[tipo] = !prev[tipo];
      return newSections;
    });
  };

  return (
    <div className="general-responsable-chart">
      <h2>Distribución por Responsables para cada Producto</h2>
      {Object.entries(groupedByProducto).map(([tipo, registros], idx) => (
        <div key={idx} className="producto-chart-section">
          <button className="toggle-chart-btn" onClick={() => toggleSection(tipo)}>
            {openSections[tipo]
              ? `Ocultar gráfico para ${tipo}`
              : `Mostrar gráfico para ${tipo}`}
          </button>
          {openSections[tipo] && (
            <div className="chart-panel">
              <h3>{tipo}</h3>
              <ResponsableChartForProducto registros={registros} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [responsablesUnicos, setResponsablesUnicos] = useState([]);
  const [showChart, setShowChart] = useState({});
  const [showGeneralChart, setShowGeneralChart] = useState(false);
  const [showResponsableGeneralChart, setShowResponsableGeneralChart] = useState(false);

  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((jsonData) => {
        setDatos(jsonData);
        const responsables = [
          ...new Set(jsonData.map((item) => item.RESPONSABLE?.trim().toUpperCase())),
        ];
        setResponsablesUnicos(responsables.sort());
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []);

  const datosFiltrados = busqueda.trim()
    ? datos.filter((item) =>
        item.RESPONSABLE?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  const agrupadosPorResponsable = datosFiltrados.reduce((acum, item) => {
    const responsable = item.RESPONSABLE?.trim();
    if (!acum[responsable]) acum[responsable] = [];
    acum[responsable].push(item);
    return acum;
  }, {});

  const handleSelect = (e) => {
    setBusqueda(e.target.value);
    setShowChart({});
    setShowGeneralChart(false);
    setShowResponsableGeneralChart(false);
  };

  const handleClear = () => {
    setBusqueda("");
    setShowChart({});
    setShowGeneralChart(false);
    setShowResponsableGeneralChart(false);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setShowChart({});
    setShowGeneralChart(false);
    setShowResponsableGeneralChart(false);
  };

  const toggleChartDisplay = (responsable) => {
    setShowChart((prev) => (prev[responsable] ? {} : { [responsable]: true }));
  };

  const toggleGeneralChartDisplay = () => {
    setShowGeneralChart((prev) => {
      const newValue = !prev;
      if (newValue) {
        setShowResponsableGeneralChart(false);
      }
      return newValue;
    });
    setShowChart({});
  };

  const toggleResponsableGeneralChartDisplay = () => {
    setShowResponsableGeneralChart((prev) => {
      const newValue = !prev;
      if (newValue) {
        setShowGeneralChart(false);
      }
      return newValue;
    });
    setShowChart({});
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
              onChange={handleBusquedaChange}
              aria-label="Buscar por nombre del responsable"
            />
            {busqueda && (
              <button className="clear-btn" onClick={handleClear} aria-label="Limpiar búsqueda">
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gráfica general global */}
      {datos.length > 0 && (
        <div className="general-chart-section">
          <button className="toggle-chart-btn" onClick={toggleGeneralChartDisplay}>
            {showGeneralChart ? "Ocultar gráfica general" : "Mostrar gráfica general"}
          </button>
          {showGeneralChart && (
            <div className="general-chart-panel">
              <h2>Gráfica General de Productos</h2>
              <ChartDisplay registros={datos} />
            </div>
          )}
        </div>
      )}

      {/* Gráfica general por responsables */}
      {datos.length > 0 && (
        <div className="general-chart-section">
          <button className="toggle-chart-btn" onClick={toggleResponsableGeneralChartDisplay}>
            {showResponsableGeneralChart
              ? "Ocultar gráfica general por responsables"
              : "Mostrar gráfica general por responsables"}
          </button>
          {showResponsableGeneralChart && <GeneralResponsableChart datos={datos} />}
        </div>
      )}

      {/* Resultados individuales por responsable */}
      {busqueda.trim() !== "" && (
        <div className="resultados">
          {Object.keys(agrupadosPorResponsable).length > 0 ? (
            Object.entries(agrupadosPorResponsable).map(([responsable, registros], idx) => {
              const agrupadosPorProducto = registros.reduce((acum, item) => {
                const tipo = item["TIPO DE PRODUCTO"];
                if (!acum[tipo]) acum[tipo] = [];
                acum[tipo].push(item);
                return acum;
              }, {});
              return (
                <div key={idx} className="responsable-group">
                  <h2>{responsable}</h2>
                  <p>
                    Total de tipos de producto: {Object.keys(agrupadosPorProducto).length}
                  </p>
                  <button
                    className="toggle-chart-btn"
                    onClick={() => toggleChartDisplay(responsable)}
                  >
                    {showChart[responsable] ? "Ocultar gráfica" : "Mostrar gráfica"}
                  </button>
                  {showChart[responsable] && <ChartDisplay registros={registros} />}
                  {Object.entries(agrupadosPorProducto).map(([tipo, productos], i) => (
                    <div key={i} className="producto-group">
                      <h3>
                        {tipo} ({productos.length} registro{productos.length > 1 ? "s" : ""})
                      </h3>
                      <ProductoList productos={productos} itemsPerPage={5} />
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <p className="no-resultados">❌ No se encontraron responsables que coincidan.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
