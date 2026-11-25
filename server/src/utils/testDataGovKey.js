const key = '579b464db66ec23bdd000001533c7a5f1b21458d61549b656b8ed4f1';
const resourceId = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${key}&format=json&limit=5`;

console.log('Testing endpoint:', url.replace(key, 'KEY_HIDDEN'));

fetch(url)
  .then(res => {
    console.log('HTTP Status:', res.status, res.statusText);
    return res.json();
  })
  .then(data => {
    console.log('Response Status field:', data.status);
    console.log('Total records available:', data.total);
    console.log('Count returned in this batch:', data.count || (data.records ? data.records.length : 0));
    if (data.records && data.records.length > 0) {
      console.log('Sample station record:', JSON.stringify(data.records[0], null, 2));
    } else {
      console.log('Response body:', JSON.stringify(data).slice(0, 400));
    }
  })
  .catch(err => {
    console.error('Error contacting data.gov.in:', err);
  });
