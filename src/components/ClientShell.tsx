useEffect(() => {
	let channel: any

	async function setupProfile() {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (user) {
			// 1. Initial Fetch
			const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()

			if (data) {
				setProfile({
					name: data.full_name || '',
					avatar: data.avatar_url || '',
				})
			}

			// 2. ✅ REALTIME SUBSCRIPTION
			// Listen for any UPDATE to the current user's row in the 'profiles' table
			channel = supabase
				.channel('profile-update-channel')
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'profiles',
						filter: `id=eq.${user.id}`,
					},
					(payload) => {
						// Automatically update state when DB changes
						setProfile({
							name: payload.new.full_name || '',
							avatar: payload.new.avatar_url || '',
						})
					},
				)
				.subscribe()
		}
	}

	setupProfile()

	// 3. Cleanup: Stop listening when user leaves the app
	return () => {
		if (channel) supabase.removeChannel(channel)
	}
}, [])
