"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function loadAssetsFromServerAction(userId) {
  try {
    const res = await fetch(`${API_URL}/api/assets-manage?userId=${userId}`);
    const result = await res.json();
    return { success: res.ok, ...result };
  } catch (error) {
    console.error('Error loading assets action:', error);
    return { success: false, error: 'Failed to load saved assets' };
  }
}

export async function saveAssetsToServerAction(payload, assetId) {
  try {
    const url = `${API_URL}/api/assets-manage`;
    const method = assetId ? 'PUT' : 'POST';
    const body = assetId ? JSON.stringify({ id: assetId, ...payload }) : JSON.stringify(payload);

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    const result = await response.json();
    return { success: response.ok, ...result };

  } catch (error) {
    console.error('Error saving assets action:', error);
    return { success: false, error: 'Failed to save assets. Please try again.' };
  }
}

export async function deleteAssetAction(assetId, fieldName) {
  try {
    const res = await fetch(`${API_URL}/api/assets-manage?id=${assetId}&field=${fieldName}`, {
      method: "DELETE",
    });
    const result = await res.json();
    return { success: res.ok, ...result };
  } catch (error) {
    console.error('Error deleting asset action:', error);
    return { success: false, error: 'Failed to delete asset. Please try again.' };
  }
}