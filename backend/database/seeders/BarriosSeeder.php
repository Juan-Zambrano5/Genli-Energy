<?php

namespace Database\Seeders;

use App\Models\Barrio;
use Illuminate\Database\Seeder;

class BarriosSeeder extends Seeder
{
    public function run()
    {
        $barrios = [
            'Avenida Boyacá', 'Avenida Santander', 'Bomboná', 'Caracha', 'Centro',
            'Condominio Santiago', 'El Churo', 'El Cilindro', 'El Portalito',
            'El Parque', 'Hullaguanga', 'La Panadería', 'Las Américas',
            'Los Dos Puentes', 'Marcos de la Rosa', 'San Agustín Centro',
            'San Andrés', 'San Andresito', 'San José', 'San José Obrero', 'Santiago',
            'Alhambra', 'Aire Libre', 'Atahualpa', 'Bella Vista', 'Casa Bella',
            'Coliseo Cubierto', 'El Olivo', 'El Prado', 'El Recuerdo', 'Fátima',
            'Javeriano', 'Julián Bucheli', 'La Gran Colombia', 'Las Lunas I',
            'Las Lunas II', 'Las Violetas', 'Los Abedules', 'Los Álamos',
            'Los Balcones', 'Los Olivos', 'Medardo Bucheli', 'Navarrete',
            'Normandía', 'Parque Bolívar', 'Salomón', 'San Miguel',
            'San Juan Bosco', 'Villa Lucía', 'Alejandría', 'Arnulfo Guerrero',
            'Caicedonia', 'Camilo Torres', 'Casa Loma', 'El Ejido', 'Guamuez',
            'José Antonio Galán', 'La Esmeralda', 'La Estrella', 'Las Brisas',
            'Las Lajas', 'Las Mercedes', 'Los Pinos', 'Mercedario',
            'Pie de Cuesta', 'Pinar del Río', 'Popular', 'Pucalpa I',
            'Pucalpa II', 'Pucalpa III', 'Rosal del Oriente', 'Santa Bárbara',
            'Santa Catalina', 'Santa Mónica', 'Villa Oriente', 'Villa Flor I',
            'Villa Flor II', 'Agualongo', 'Altamira', 'Altamira I', 'Anganoy',
            'Bachué', 'Caicedo', 'Colón', 'Colpatria', 'El Bosque',
            'El Edén', 'El Remanso', 'Francisco de la Villota',
            'Gilberto Pabón', 'Grana', 'Achalay', 'Briceño',
            'Calatrava', 'Camino Real', 'Alameda El Común', 'Alcázares',
            'Altos de la Carolina', 'Aquine', 'Aranda', 'Balcones del Este',
            'Belalcázar', 'Bellavista', 'Carlos Pizarro', 'Centenario',
            'Ciudad Real', 'Cujacal', 'El Algibe', 'El Obrero',
        ];

        foreach ($barrios as $nombre) {
            Barrio::create(['nombre' => $nombre]);
        }
    }
}
