// src/components/student/ProposalCard.js

import React, { useState } from 'react';
import '../../styles/ProposalFeed.css'; // Usaremos o mesmo ficheiro CSS

// Um pequeno componente helper para o ícone de estrela
const StarIcon = ({ isFavorited }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill={isFavorited ? "#e53935" : "none"} // Cor preenchida se for favorito
        stroke={isFavorited ? "#e53935" : "#aaa"} // Cor da borda
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);


const ProposalCard = ({ proposal, onViewDetails }) => {
    // favorito (apenas visual por agora)
    const [isFavorited, setIsFavorited] = useState(false);

    // Função para lidar com o clique na estrela
    const handleFavoriteClick = (e) => {
        e.stopPropagation(); 
        setIsFavorited(!isFavorited);
        // chamada à API para guardar este estado............
        console.log(`Proposta ${!isFavorited ? 'marcada como favorita' : 'desmarcada'}: ${proposal.id}`);
    };

    return (
        <div className="pro-card-stylish" onClick={() => onViewDetails(proposal)}>
            
            {/* Placeholder para o logo da empresa */}
            <div className="pro-card-logo">
                <span>{proposal.company_name.charAt(0)}</span>
            </div>

            <div className="pro-card-content">
                <div className="pro-card-header">
                    <span className="pro-card-company">{proposal.company_name}</span>
                    <button className="pro-card-favorite-btn" onClick={handleFavoriteClick}>
                        <StarIcon isFavorited={isFavorited} />
                    </button>
                </div>

                <h4 className="pro-card-title">{proposal.title}</h4>

                <p className="pro-card-description">
                    {proposal.description.substring(0, 120)}{proposal.description.length > 120 ? '...' : ''}
                </p>

                <div className="pro-card-footer">
                    <span className="pro-card-tag">{proposal.proposal_type}</span>
                </div>
            </div>
        </div>
    );
};

export default ProposalCard;