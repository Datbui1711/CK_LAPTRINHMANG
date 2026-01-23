import { useEffect, useState } from "react";
import styles from "./FriendPage.module.css";
import FriendCard from "./components/FriendCard/FriendCard";
import { getFriends, searchFriends } from "../../services/friendService";
import { useDebounce } from "../../hooks/useDebounce";

function FriendPage() {
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm.trim(), 500);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await getFriends();
                setFriends(response || []);
            } catch (err) {
                console.log(err);
                setFriends([]);
            }
        };

        fetchFriends();
    }, []);

    useEffect(() => {
        const fetchFriends = async () => {
            setIsSearching(true);
            try {
                const response = await searchFriends(debouncedSearchTerm);
                setFriends(response || []);
            } catch (err) {
                console.error(err);
                setFriends([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchFriends();
    }, [debouncedSearchTerm]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Danh sách bạn bè</h1>
                <div className={styles.stats}>
                    <span className={styles.onlineIndicator}></span>
                    <span>999 online</span>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchContainer}>
                    <svg
                        className={styles.searchIcon}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bạn bè..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching && (
                        <div className={styles.loadingSpinner}></div>
                    )}
                    {searchTerm && (
                        <button
                            className={styles.clearButton}
                            onClick={() => setSearchTerm("")}
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className={styles.statusFilters}>
                    <button
                        disabled
                        className={`${styles.filterButton} ${
                            statusFilter === "all" ? styles.active : ""
                        }`}
                        onClick={() => setStatusFilter("all")}
                    >
                        Tất cả
                    </button>
                    <button
                        disabled
                        className={`${styles.filterButton} ${
                            statusFilter === "online" ? styles.active : ""
                        }`}
                        onClick={() => setStatusFilter("online")}
                    >
                        Online
                    </button>
                    <button
                        disabled
                        className={`${styles.filterButton} ${
                            statusFilter === "offline" ? styles.active : ""
                        }`}
                        onClick={() => setStatusFilter("offline")}
                    >
                        Offline
                    </button>
                </div>
            </div>
            <div className={styles.list}>
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <FriendCard
                            key={friend.user._id}
                            friend={friend.user}
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <p>Không tìm thấy bạn bè nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FriendPage;
