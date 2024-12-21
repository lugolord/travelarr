/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import { XMLParser } from "fast-xml-parser"; // Importa el parser XML
import NavBar from "./components/NavBar";
import ItemListContainer from "./components/ItemListContainer";
import ItemDetailContainer from "./components/ItemDetailContainer";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [paquetes, setPaquetes] = useState([]); // Todos los paquetes
  const [paquetesFiltrados, setPaquetesFiltrados] = useState([]); // Paquetes filtrados por país
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [paises, setPaises] = useState([]); // Lista de países
  const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const [carrito, setCarrito] = useState([]); // El estado del carrito

  useEffect(() => {
    fetch(`/admin/xml/allseasons.xml`)
      .then((response) => {
      
        if (!response.ok) {
          throw new Error("No se pudo cargar el archivo XML.");
        }
        return response.text();
      })
      .then((data) => {
        const parser = new XMLParser();
        const jsonData = parser.parse(data);

        if (jsonData?.root?.paquetes?.paquete) {
          const paquetesData = jsonData.root.paquetes.paquete;

          // Limitar la visualización inicial a 50 paquetes
          const paquetesLimitados = paquetesData.slice(0, 50);
          setPaquetes(paquetesData);
          setPaquetesFiltrados(paquetesLimitados);

          // Extraer países únicos para los filtros
          const paisesUnicos = [
            ...new Set(
              paquetesData.flatMap(
                (paquete) => paquete?.destinos?.destino?.pais || []
              )
            ),
          ];
          setPaises(paisesUnicos);
        } else {
          console.error("Estructura de datos inesperada:", jsonData);
          setError("No se encontraron paquetes.");
        }
      })
      .catch((error) => {
        setError(`Error al obtener los paquetes: ${error.message}`);
        console.error("Error al obtener los paquetes:", error);
      });
  }, []);

  // Función para manejar el cambio de país seleccionado
  const handlePaisSeleccionado = (pais) => {
    setPaisSeleccionado(pais);
    if (pais === "") {
      setPaquetesFiltrados(paquetes); // Muestra todos los paquetes si no hay filtro
    } else {
      const paquetesFiltradosPorPais = paquetes.filter(
        (paquete) =>
          paquete?.destinos?.destino?.pais?.toLowerCase() === pais.toLowerCase()
      );
      setPaquetesFiltrados(paquetesFiltradosPorPais);
    }
  };

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.some(
      (item) => item.paquete_externo_id === producto.paquete_externo_id
    );
    if (!productoExistente) {
      // Agregar producto al carrito
      setCarrito([...carrito, producto]); // Suponiendo que carrito es el estado
      setCartCount(cartCount + 1); // Incrementa el contador del carrito
    } else {
      console.log("El producto ya está en el carrito");
    }
  };

  return (
    <BrowserRouter>
      <div>
        <NavBar
          nombre="TravelAr"
          botonLabel="Ver Paquetes"
          carritoValor={cartCount}
          paises={paises}
          onPaisSeleccionado={handlePaisSeleccionado}
        />
        <Routes>
          <Route
            path="/"
            element={<ItemListContainer paquetes={paquetesFiltrados} />}
          />
          <Route
            path="/paquetes"
            element={
              <ItemList
                paquetes={paquetesFiltrados}
                onAddToCart={agregarAlCarrito}
              />
            }
          />
          <Route
            path="/detalle/:idProducto"
            element={
              <ItemDetailContainer agregarAlCarrito={agregarAlCarrito} />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
