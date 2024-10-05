// This file contant a logic include : State,Logic to render UI
import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import CategoryConfigs from './CategoryConfig'

const validateForm = (values: any) => {
    const errors: any = {};
    if (values.name.trim().length < 2) {
        errors.name = "Tên danh mục phải có ít nhất 2 ký tự.";
    }
    if (values.slug.trim().length === 0) {
        errors.slug = "Slug danh mục không được trống.";
    }
    return errors;
};

export function useCategoryCreateViewModel(){
    const form = useForm({
        initialValues: CategoryConfigs.initialCreateUpdateFormValues,
        validate: validateForm
    })

}