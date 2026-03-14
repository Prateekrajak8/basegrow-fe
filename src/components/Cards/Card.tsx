// import React from 'react';
// import styles from './cards.module.css';

// interface CardProps {
//   title: string;
//   value: number;
// }

// const Card: React.FC<CardProps> = ({ title, value }) => {
//   return (
//     <div className={styles.card}>
//       <h4>{title}</h4>
//       <p>{value}</p>
//     </div>
//   );
// };

// export default Card;

interface CardProps {
  label: string;
  value: number;
}

const Card: React.FC<CardProps> = ({ label, value }) => {
  return (
    <div className="border rounded-md p-4 shadow-sm bg-white">
      <h4 className="text-gray-600 text-sm">{label}</h4>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
};

export default Card;
