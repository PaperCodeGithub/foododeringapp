import { auth, db } from "./firebase";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
    where
} from "firebase/firestore";

export const getUserData = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        throw error;
    }
};

export const getResturants = async (lastVisible = null, pageSize = 10) => {
    try {
        let q;
        if (lastVisible) {
            q = query(
                collection(db, "restaurants"),
                startAfter(lastVisible),
                limit(pageSize)
            );
        } else {
            q = query(
                collection(db, "restaurants"),
                limit(pageSize)
            );
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];

        return { data, lastDoc, isListEnded: snapshot.empty };
    } catch (error) {
        throw error;
    }
};

export const getFoods = async (lastVisible = null, pageSize = 10) => {
    try{
        let q;
        if (lastVisible) {
            q = query(
                collection(db, "foods"),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(pageSize)
            );
        } else {
            q = query(
                collection(db, "foods"),
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        return { data, lastDoc, isListEnded: snapshot.empty };
    }catch(error) {
        throw error;
    }
}

export const addToCart = async (userId, item) => {
    try {
        const cartRef = doc(db, "users", userId, "cart", item.id);
        const docSnap = await getDoc(cartRef);

        if (docSnap.exists()) {
            const currentQty = docSnap.data().quantity;
            await updateDoc(cartRef, {
                quantity: currentQty + item.quantity,
                totalPrice: (currentQty + item.quantity) * item.price
            });
        } else {
            await setDoc(cartRef, {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                resturantName: item.resturantName,
                imageUrl: item.imageUrl || "",
                totalPrice: item.price * item.quantity,
                addedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        throw error;
    }
};

export const removeFromCart = async (userId, itemId) => {
    try {
        await deleteDoc(doc(db, "users", userId, "cart", itemId));
    } catch (error) {
        throw error;
    }
};

export const subscribeToCart = (userId, onUpdate) => {
    const q = collection(db, "users", userId, "cart");
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        onUpdate(items);
    });
};


export const placeOrder = async (userId, cartItems, totalAmount) => {
    try {
        const batch = writeBatch(db);
        const orderRef = doc(collection(db, "orders"));
        batch.set(orderRef, {
            userId: userId,
            items: cartItems,
            totalAmount: totalAmount,
            status: "Pending",
            createdAt: new Date().toISOString()
        });

        cartItems.forEach(item => {
            const itemRef = doc(db, "users", userId, "cart", item.id);
            batch.delete(itemRef);
        });

        await batch.commit();
        return orderRef.id;
    } catch (error) {
        throw error;
    }
};

export const subscribeToOrders = (userId, onUpdate) => {
    const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        onUpdate(orders);
    });
};
