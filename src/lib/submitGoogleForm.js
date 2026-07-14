/**
 * Submit responses to a public Google Form via formResponse endpoint.
 * Uses no-cors because Google does not expose CORS headers on this endpoint.
 */
export async function submitGoogleForm(actionUrl, fieldEntries) {
  const body = new URLSearchParams();
  body.set('fvv', '1');

  Object.entries(fieldEntries).forEach(([entryId, value]) => {
    body.set(entryId, value);
  });

  await fetch(actionUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString(),
  });
}
