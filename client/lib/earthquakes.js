export async function fetchEarthquakes(type, period) {
  // TODO sækja gögn frá proxy þjónustu
  if  (!type || !period) {
    return null;
  }

  const url = `/proxy?period=${period}&type=${type}`;
  var result;

  try {
    result = await fetch(url); 
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();
  console.log(`GET response status from ${url}:`, result.status);
  console.log('GET response json:', data);

  return data;
}
