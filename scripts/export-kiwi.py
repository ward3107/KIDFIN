"""Export the refined Kiwi character as a neutral, web-ready GLB."""
import bpy, os
scene=bpy.data.scenes['KIWI_Character_V2']; bpy.context.window.scene=scene
root=next(o for o in scene.objects if o.name.split('.')[0]=='KIWI_CONTROLS')
root.animation_data_clear(); root['demo_motion']=0
for prop in ['blink','blink_left','blink_right','mouth_open','mouth_round','smile','wave','look_x','look_z','head_tilt']:
    root[prop]=0.
root.update_tag(); scene.frame_set(1); bpy.context.view_layer.update()
# Apply static bevel/normal modifiers so browser appearance matches Blender.
for item in list(scene.objects):
    if item.type=='MESH' and not item.data.shape_keys:
        bpy.context.view_layer.objects.active=item
        for modifier in list(item.modifiers):
            try: bpy.ops.object.modifier_apply(modifier=modifier.name)
            except RuntimeError: pass
bpy.ops.object.select_all(action='DESELECT')
for item in scene.objects:
    if item.name.startswith('KIWI_') and item.type not in {'LIGHT','CAMERA'} and not item.hide_render and not item.name.startswith('KIWI_Lid_crease'):
        item.hide_set(False); item.select_set(True)
out=os.path.abspath('public/models/kiwi-expressive.glb')
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    use_selection=True,
    export_animations=False,
    export_extras=False,
    export_yup=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
)
print('EXPORTED',out)
