import { supabase } from "../../config/supabase.js";

const create = async (payload) => {

    const { data, error } = await supabase

        .from("gallery_images")

        .insert(payload)

        .select()

        .single();

    if (error) throw error;

    return data;
};

const createMany = async (payload) => {

    const { data, error } = await supabase

        .from("gallery_images")

        .insert(payload)

        .select();

    if (error) throw error;

    return data;
};

const findByCarpenter = async (carpenterId) => {

    const { data, error } = await supabase

        .from("gallery_images")

        .select("*")

        .eq("carpenter_id", carpenterId)

        .order("created_at", {

            ascending: false

        });

    if (error) throw error;

    return data;
};

const findById = async (id) => {

    const { data, error } = await supabase

        .from("gallery_images")

        .select("*")

        .eq("id", id)

        .single();

    if (error) throw error;

    return data;
};

const findByType = async (carpenterId, imageType) => {

    const { data, error } = await supabase

        .from("gallery_images")

        .select("*")

        .eq("carpenter_id", carpenterId)

        .eq("image_type", imageType)

        .maybeSingle();

    if (error) throw error;

    return data;
};

const remove = async (imageId) => {

    const { error } = await supabase

        .from("gallery_images")

        .delete()

        .eq("id", imageId);

    if (error) throw error;

    return true;
};

const update = async (imageId, payload) => {

    const { data, error } = await supabase

        .from("gallery_images")

        .update(payload)

        .eq("id", imageId)

        .select()

        .single();

    if (error) throw error;

    return data;
};

const countByCarpenter = async (carpenterId) => {

    const { count, error } = await supabase

        .from("gallery_images")

        .select("*", {

            count: "exact",

            head: true

        })

        .eq("carpenter_id", carpenterId);

    if (error) throw error;

    return count;
};

export const GalleryRepository = {

    create,

    createMany,

    findById,

    findByCarpenter,

    findByType,

    update,

    remove,

    countByCarpenter,
};