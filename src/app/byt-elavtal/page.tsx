import SalesysForm from '@/components/SalesysForm';

export default function BytElavtal() {
  return (
    <main className="container">
      <h1>Byt elavtal</h1>
      <p>Fyll i formuläret nedan för att påbörja bytet.</p>
      <SalesysForm
        containerId="form-container"
        formId="68b05450a1479b5cec96958c"
        options={{ width: "100%", test: true }}
        defaultFields={[{ fieldId: "66e9457420ef2d3b8c66f500", value: "2000" }]}
      />
    </main>
  );
}