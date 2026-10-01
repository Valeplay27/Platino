import { getAssetUrl } from "../utils/assetHelper";

export const sedesData = [
  {
    id: "lima-centro",
    name: "Sede Lima Centro",
    subtitle: "Platino Perú Joyería Fina",
    address: "Jr. de la Unión 446, Lima 15001",
    district: "Cercado de Lima",
    reference: "En pleno Centro Histórico de Lima, a pasos de la Plaza de Armas",
    mapsUrl: "https://maps.app.goo.gl/fbS5VVr2qUGXLkGk7",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.9961622329837!2d-77.0345686!3d-12.0468925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b674f0e951%3A0xd53c74ddc9aebe35!2sPlatino%20Per%C3%BA%20Joyer%C3%ADa%20Fina!5e0!3m2!1ses-419!2spe!4v1727720000000!5m2!1ses-419!2spe",
    phone: "011 654 435",
    whatsapp: "+51927357217",
    whatsappDisplay: "927 357 217",
    hours: "Lunes a Sábado: 10:00 am - 7:00 pm",
    breakTime: "Refrigerio: 1:00 pm - 2:00 pm",
    image: getAssetUrl("/images/showroom.jpg"),
    services: [
      "Exhibición exclusiva de aros de boda y compromiso",
      "Asesoría personalizada con gemólogos certificados",
      "Entallado y prueba de tallas en sitio",
      "Mantenimiento y limpieza de joyas"
    ]
  },
  {
    id: "miraflores",
    name: "Sede Miraflores",
    subtitle: "Galería Multicentro",
    address: "Av. José Larco 345, Tienda S-9 (Sótano), Miraflores 15074",
    district: "Miraflores",
    reference: "Galería Multicentro, a 2 cuadras del Parque Kennedy",
    mapsUrl: "https://maps.app.goo.gl/r29fPJUH3UavUsWQ7",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.902341232812!2d-77.0315682!3d-12.1215421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c9d86eb6eef7%3A0xbc4374f5e54a1e13!2sPlatino%20Per%C3%BA%20Joyer%C3%ADa!5e0!3m2!1ses-419!2spe!4v1727720000000!5m2!1ses-419!2spe",
    phone: "011 654 435",
    whatsapp: "+51984281116",
    whatsappDisplay: "984281116",
    hours: "Lunes a Sábado: 10:00 am - 7:00 pm",
    breakTime: "Refrigerio: 1:00 pm - 2:00 pm",
    image: getAssetUrl("/images/hero-matrimonio.jpg"),
    services: [
      "Atención nupcial privada y personalizada",
      "Muestrario completo de diamantes y piedras preciosas",
      "Personalización y grabado láser",
      "Entrega segura de pedidos web"
    ]
  }
];
