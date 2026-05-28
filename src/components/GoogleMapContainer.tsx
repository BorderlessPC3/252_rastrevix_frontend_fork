import type React from "react";

type GoogleMapContainerProps = {
  mapRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  error?: string | null;
  loading?: boolean;
  children?: React.ReactNode;
};

const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  mapRef,
  className = "map",
  error,
  loading,
  children,
}) => (
  <div className={`${className} google-map-wrapper`}>
    <div ref={mapRef} className="google-map-canvas" />
    {(loading || error) && (
      <div className="google-map-overlay" role="status">
        {loading && !error && <p>Carregando mapa…</p>}
        {error && (
          <>
            <p className="google-map-overlay-title">Google Maps indisponível</p>
            <p className="google-map-overlay-hint">{error}</p>
          </>
        )}
      </div>
    )}
    {children}
  </div>
);

export default GoogleMapContainer;
