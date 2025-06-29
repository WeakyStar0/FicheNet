// src/components/student/ProposalCard.js

import React from 'react';
import '../../styles/ProposalFeed.css';

const ProposalCard = ({ proposal, onViewDetails }) => {
    return (
        <div className="proposal-card" onClick={() => onViewDetails(proposal)}>
            <div className="proposal-card-header">
                <h3 className="proposal-company">{proposal.company_name}</h3>
                <span className="proposal-title-tags">{proposal.title}</span>
            </div>
            <p className="proposal-description">
                {proposal.description.substring(0, 150)}{proposal.description.length > 150 ? '...' : ''}
            </p>
        </div>
    );
};

export default ProposalCard;