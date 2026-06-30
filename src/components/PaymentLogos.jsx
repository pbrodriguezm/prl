// Logos de pago como SVG inline — sin imágenes externas, sin requests
export default function PaymentLogos() {
  return (
    <div className="payments" role="complementary" aria-label="Métodos de pago aceptados">
      <svg role="img" aria-label="Visa" width="60" height="28" viewBox="0 0 60 28" fill="none">
        <text x="2" y="22" fontFamily="Arial" fontWeight="900" fontSize="22" fill="#1A1F71">VISA</text>
      </svg>
      <svg role="img" aria-label="Mastercard" width="46" height="28" viewBox="0 0 46 28">
        <circle cx="16" cy="14" r="13" fill="#EB001B"/>
        <circle cx="30" cy="14" r="13" fill="#F79E1B"/>
        <path d="M23 5.5a13 13 0 0 1 0 17 13 13 0 0 1 0-17z" fill="#FF5F00"/>
      </svg>
      <svg role="img" aria-label="Diners Club International" width="100" height="28" viewBox="0 0 100 28">
        <rect width="100" height="28" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1"/>
        <text x="8" y="19" fontFamily="Arial" fontWeight="700" fontSize="10" fill="#003087">Diners Club</text>
        <text x="8" y="26" fontFamily="Arial" fontSize="7" fill="#666">INTERNATIONAL</text>
      </svg>
      <svg role="img" aria-label="American Express" width="60" height="28" viewBox="0 0 60 28">
        <rect width="60" height="28" rx="4" fill="#2E77BC"/>
        <text x="5" y="13" fontFamily="Arial" fontWeight="700" fontSize="7" fill="#fff">AMERICAN</text>
        <text x="5" y="22" fontFamily="Arial" fontWeight="700" fontSize="7" fill="#fff">EXPRESS</text>
      </svg>
      <svg role="img" aria-label="PayPal" width="80" height="28" viewBox="0 0 80 28">
        <text x="2" y="20" fontFamily="Arial" fontWeight="700" fontSize="18" fill="#003087">Pay</text>
        <text x="32" y="20" fontFamily="Arial" fontWeight="700" fontSize="18" fill="#009CDE">Pal</text>
      </svg>
      <svg role="img" aria-label="SafetyPay" width="90" height="28" viewBox="0 0 90 28">
        <text x="2" y="20" fontFamily="Arial" fontWeight="700" fontSize="14" fill="#F7941D">safety</text>
        <text x="52" y="20" fontFamily="Arial" fontWeight="700" fontSize="14" fill="#231F20">pay</text>
      </svg>
      <svg role="img" aria-label="UnionPay" width="70" height="28" viewBox="0 0 70 28">
        <rect width="24" height="28" rx="3" fill="#E21836"/>
        <rect x="26" width="44" height="28" rx="3" fill="#007B5E"/>
        <text x="3" y="20" fontFamily="Arial" fontWeight="900" fontSize="16" fill="#fff">銀</text>
        <text x="29" y="20" fontFamily="Arial" fontWeight="700" fontSize="12" fill="#fff">Union</text>
      </svg>
    </div>
  )
}
