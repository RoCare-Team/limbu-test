// Google My Business API helper functions

export async function fetchGoogleAccounts(accessToken) {
  try {
    const accountsRes = await fetch("https://mybusinessbusinessinformation.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })

    if (!accountsRes.ok) {
      throw new Error("Failed to fetch Google accounts")
    }
    
    

    const accountsData = await accountsRes.json()
    return accountsData.accounts || []
  } catch (error) {
    console.error("Error fetching Google accounts:", error)
    throw error
  }
}

export async function fetchLocationsByAccount(accessToken, accountId) {
  try {
    const locationsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storefrontAddress,websiteUri,phoneNumbers,categories,openInfo,metadata`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    if (!locationsRes.ok) {
      throw new Error(`Failed to fetch locations for account ${accountId}`)
    }

    const locData = await locationsRes.json()
    return locData.locations || []
  } catch (error) {
    console.error(`Error fetching locations for account ${accountId}:`, error)
    throw error
  }
}

export async function fetchAllLocations(accessToken, accounts) {
  let allLocations = []

  for (const account of accounts) {
    try {
      const accountId = account.name.replace("accounts/", "")
      const locations = await fetchLocationsByAccount(accessToken, accountId)

      const locationsWithAccount = locations.map((loc) => ({
        ...loc,
        accountId,
        accountName: account.accountName || account.name,
      }))

      allLocations = [...allLocations, ...locationsWithAccount]
    } catch (error) {
      console.error(`Failed to fetch locations for account ${account.name}:`, error)
      // Continue with other accounts even if one fails
    }
  }

  return allLocations
}

export async function fetchLocationInsights(accessToken, locationName, startDate, endDate) {
  try {
    const insightsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/insights:reportInsights`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationNames: [locationName],
          basicRequest: {
            timeRange: {
              startTime: startDate,
              endTime: endDate,
            },
            metricRequests: [
              { metric: "QUERIES_DIRECT" },
              { metric: "QUERIES_INDIRECT" },
              { metric: "VIEWS_MAPS" },
              { metric: "VIEWS_SEARCH" },
              { metric: "ACTIONS_WEBSITE" },
              { metric: "ACTIONS_PHONE" },
              { metric: "ACTIONS_DRIVING_DIRECTIONS" },
            ],
          },
        }),
      },
    )

    if (!insightsRes.ok) {
      throw new Error(`Failed to fetch insights for location ${locationName}`)
    }

    const insightsData = await insightsRes.json()
    return insightsData
  } catch (error) {
    console.error(`Error fetching insights for location ${locationName}:`, error)
    throw error
  }
}

export async function updateLocationInfo(accessToken, locationName, updateData) {
  try {
    const updateRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!updateRes.ok) {
      throw new Error(`Failed to update location ${locationName}`)
    }

    const updatedLocation = await updateRes.json()
    return updatedLocation
  } catch (error) {
    console.error(`Error updating location ${locationName}:`, error)
    throw error
  }
}
