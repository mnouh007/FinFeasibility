interface NominatimResponse {
    display_name: string;
    error?: string;
}

export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en'
            }
        });
        if (!response.ok) {
            throw new Error(`Nominatim API failed with status: ${response.status}`);
        }
        const data: NominatimResponse = await response.json();
        if (data.error) {
            throw new Error(`Nominatim error: ${data.error}`);
        }
        return data.display_name;
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return "Could not fetch address.";
    }
};
