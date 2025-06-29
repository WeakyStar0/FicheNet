// src/components/student/RecommendedProposals.js

import React from 'react';
import ProposalCard from './ProposalCard';
import '../../styles/ProposalFeed.css';

const RecommendedProposals = ({ proposals, onViewDetails }) => {
    return (
        <div className="recommendation-section">
            <h2 className="recommendation-title">★ Recomendadas para Si</h2>
            <div className="proposal-list recommended">
                {proposals.map(p => (
                    <ProposalCard key={`rec-${p.id}`} proposal={p} onViewDetails={onViewDetails} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedProposals;