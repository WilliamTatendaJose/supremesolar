const siteContent = {
  services: [
    {
      title: 'Solar Power Systems',
      description: 'Grid-tied, off-grid, and hybrid installations',
      image: 'img/product-1.jpg',
      modalTarget: '#exampleModalLong',
      modalTitle: 'Solar Power Systems',
      modalBody: [
        'Our solar power systems are designed to lower energy costs while keeping your property powered reliably through Zimbabwe’s changing grid conditions.',
        'We assess your energy needs, roof layout, and budget to recommend the right system layout, whether it is a compact residential installation or a larger commercial setup.'
      ]
    },
    {
      title: 'Water & Borehole Solutions',
      description: 'Drilling, surveying, and pump installation',
      image: 'img/product-2.jpg',
      modalTarget: '#exampleModalLong2',
      modalTitle: 'Borehole Drilling and Surveying',
      modalBody: [
        'We provide borehole drilling and surveying services that help clients locate and access dependable water sources with accuracy and care.',
        'Our team supports the full process from site assessment and survey work to drilling and pump installation, ensuring your water system is practical and built to last.'
      ]
    },
    {
      title: 'Maintenance & Repairs',
      description: 'Prompt support for solar and water systems',
      image: 'img/product-3.jpg',
      modalTarget: '#exampleModalLong3',
      modalTitle: 'Repairs and Maintenance',
      modalBody: [
        'We offer maintenance and repair services to keep your solar and water systems performing at their best even after the initial installation.',
        'Whether you need a system check, pump repair, inverter troubleshooting, or preventive servicing, our team is ready to respond quickly and professionally.'
      ]
    }
  ],
  gallery: [
    { image: 'img/gallery-1.jpg', alt: 'Completed solar installation project' },
    { image: 'img/gallery-2.jpg', alt: 'Borehole drilling site' },
    { image: 'img/gallery-3.jpg', alt: 'Solar system installation' },
    { image: 'img/gallery-4.jpg', alt: 'Pump and water system setup' },
    { image: 'img/gallery-5.jpg', alt: 'Residential solar project' },
    { image: 'img/gallery-6.jpg', alt: 'Commercial solar and water solution' }
  ]
};

function renderSiteContent() {
  const serviceCards = document.querySelectorAll('#service .product-item');
  serviceCards.forEach((card, index) => {
    const service = siteContent.services[index];
    if (!service) return;

    const img = card.querySelector('.product-img img');
    const link = card.querySelector('.product-img a');
    const title = card.querySelector('.bg-secondary h3');
    const description = card.querySelector('.bg-secondary p');

    if (img) {
      img.src = service.image;
      img.alt = service.title;
    }
    if (link) {
      link.setAttribute('data-target', service.modalTarget);
    }
    if (title) title.textContent = service.title;
    if (description) description.textContent = service.description;
  });

  const galleryItems = document.querySelectorAll('#project .gallery-item');
  galleryItems.forEach((item, index) => {
    const galleryItem = siteContent.gallery[index];
    if (!galleryItem) return;

    const img = item.querySelector('img');
    const link = item.querySelector('a');
    if (img) {
      img.src = galleryItem.image;
      img.alt = galleryItem.alt;
    }
    if (link) {
      link.href = galleryItem.image;
      link.setAttribute('data-lightbox', 'gallery');
    }
  });

  siteContent.services.forEach((service) => {
    const modal = document.querySelector(service.modalTarget);
    if (!modal) return;

    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    if (modalTitle) modalTitle.textContent = service.modalTitle;
    if (modalBody) {
      modalBody.innerHTML = `
        <img class="img-fluid mb-4" src="${service.image}" alt="${service.modalTitle}">
        ${service.modalBody.map((paragraph) => `<p>${paragraph}</p>`).join('')}
      `;
    }
  });
}

document.addEventListener('DOMContentLoaded', renderSiteContent);
