import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { getAddressFromCoordinates } from '../../services/locationService';

// Fix for default icon issue with bundlers.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([26.8206, 30.8025], 5); // Default to Egypt

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        mapRef.current.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            setIsLoading(true);
            setSelectedCoords({ lat, lng });
            setSelectedAddress(t('m1_projectDefinition.mapModal.fetchingAddress')+'...');

            if (markerRef.current) {
                markerRef.current.setLatLng(e.latlng);
            } else {
                markerRef.current = L.marker(e.latlng).addTo(mapRef.current!);
            }
            
            const address = await getAddressFromCoordinates(lat, lng);
            setSelectedAddress(address);
            setIsLoading(false);
        });
    }

    // Leaflet map needs to be invalidated when the modal is shown to render correctly.
    if(isOpen && mapRef.current) {
        setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [isOpen, t]);

  const handleConfirm = () => {
    if (selectedAddress && selectedCoords && selectedAddress !== t('m1_projectDefinition.mapModal.fetchingAddress')+'...') {
        onConfirm(selectedAddress, selectedCoords.lat, selectedCoords.lng);
    }
    onClose();
  };

  const handleClose = () => {
      setSelectedAddress('');
      setSelectedCoords(null);
      setIsLoading(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('m1_projectDefinition.mapModal.title')} size="3xl">
      <div id="map-container" ref={mapContainerRef} style={{ height: '500px', width: '100%', zIndex: 0 }}></div>
      <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md min-h-[60px]">
        <p className="text-sm font-medium">{t('m1_projectDefinition.mapModal.selectedAddress')}:</p>
        <p className="text-gray-800 dark:text-gray-200">{selectedAddress || t('m1_projectDefinition.mapModal.prompt')}</p>
      </div>
      <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleConfirm} disabled={isLoading || !selectedAddress || selectedAddress === t('m1_projectDefinition.mapModal.fetchingAddress')+'...'}>
          {t('common.confirm')}
        </Button>
      </div>
    </Modal>
  );
};