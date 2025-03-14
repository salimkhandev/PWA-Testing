import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useContextAPI } from './ContextAPI';
import NotificationButton from './NotificationButton';

const Home = () => {
  const { value } = useContextAPI();
  const { showNotification } = useNotification();
  const features = [
    {
      title: "Modern Design",
      description: "Clean and modern interface built with the latest web technologies",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80",
    },
    {
      title: "Responsive",
      description: "Fully responsive design that works on all devices",
      image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=500&q=80",
    },
    {
      title: "Progressive",
      description: "Progressive Web App capabilities for offline use",
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500&q=80",
    }
  ];

  useEffect(() => {
    // Listen for push messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'PUSH_NOTIFICATION') {
        const { title, body, type } = event.data.payload;
        showNotification(`${title}: ${body}`, type || 'info');
      }
    });
  }, [showNotification]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="fade-in">
        <header className="text-center mb-12">
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700,
            marginBottom: '1rem',
            fontFamily: 'Montserrat, sans-serif'
          }}
          >
            Welcome to Our PWA 
          </h1>
        
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Experience the power of modern web applications with our Progressive Web App
          </p>
        </header>

        <div className="card-grid">
          {features.map((feature, index) => (
            <div key={index} className="card slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <img src={feature.image} alt={feature.title} />
              <div className="card-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <NotificationButton />
      </div>
    </div>
  );
};

export default Home; 
